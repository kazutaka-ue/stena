import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer as createNetServer } from 'node:net';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve('.');
const VIEWPORTS = [
  { name: 'sp', width: 390, height: 844, mobile: true },
  ...(process.argv.includes('--sp420')
    ? [{ name: 'sp420', width: 420, height: 900, mobile: true }]
    : []),
  { name: 'pc', width: 1440, height: 1000, mobile: false },
];
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function readOption(name){
  const inline = process.argv.find(arg => arg.startsWith(`--${name}=`));
  if(inline) return inline.slice(name.length + 3);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : '';
}

const captureIds = readOption('capture').split(',').map(value => value.trim()).filter(Boolean);
const reportOnly = process.argv.includes('--report-only');
const introOnly = process.argv.includes('--intro-only');
const page = readOption('page') || 'preview.html';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = join(tmpdir(), `stena-layout-audit-${stamp}`);
const edgeProfile = join(tmpdir(), `stena-layout-audit-edge-${process.pid}`);
mkdirSync(outputDir, { recursive: true });

function findEdge(){
  const candidates = [
    process.env.EDGE_PATH,
    process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
  ].filter(Boolean);
  const executable = candidates.find(candidate => existsSync(candidate));
  if(!executable) throw new Error('Microsoft Edge が見つかりません。EDGE_PATH で実行ファイルを指定してください。');
  return executable;
}

function freePort(){
  return new Promise((resolvePort, reject) => {
    const probe = createNetServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolvePort(port));
    });
  });
}

function startStaticServer(){
  return new Promise((resolveServer, reject) => {
    const server = createServer((request, response) => {
      try{
        const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
        const relative = pathname === '/' ? 'preview.html' : pathname.replace(/^\/+/, '');
        const file = normalize(join(ROOT, relative));
        if(!file.startsWith(ROOT) || !existsSync(file)){
          response.writeHead(404);
          response.end('Not Found');
          return;
        }
        const data = readFileSync(file);
        response.writeHead(200, {
          'Cache-Control': 'no-store',
          'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        });
        response.end(data);
      }catch(error){
        response.writeHead(500);
        response.end(String(error?.message || error));
      }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolveServer(server));
  });
}

const wait = milliseconds => new Promise(resolveWait => setTimeout(resolveWait, milliseconds));

async function waitForTarget(port){
  for(let attempt = 0; attempt < 60; attempt += 1){
    try{
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
      const page = targets.find(target => target.type === 'page');
      if(page) return page;
    }catch(_error){}
    await wait(200);
  }
  throw new Error('Edge DevTools へ接続できませんでした。');
}

function connectCdp(url){
  const socket = new WebSocket(url);
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const handler = pending.get(message.id);
    if(!handler) return;
    pending.delete(message.id);
    if(message.error) handler.reject(new Error(message.error.message));
    else handler.resolve(message.result);
  });
  return {
    open: new Promise((resolveOpen, reject) => {
      socket.addEventListener('open', resolveOpen, { once: true });
      socket.addEventListener('error', reject, { once: true });
    }),
    send(method, params = {}){
      return new Promise((resolveSend, reject) => {
        const id = ++sequence;
        pending.set(id, { resolve: resolveSend, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close(){
      socket.close();
    },
  };
}

function auditExpression(viewport, scopedToIntro = false){
  const settings = {
    pc: {
      sectionFloors: { H1: 32, H2: 26, H3: 20, H4: 18 },
      contentFloors: { H1: 32, H2: 26, H3: 18, H4: 18 },
      componentFloors: { H1: 32, H2: 24, H3: 16, H4: 16 },
      maxLines: { H1: 3, H2: 3, H3: 3, H4: 4 },
      bodyFloor: 16,
    },
    sp: {
      sectionFloors: { H1: 24, H2: 20, H3: 18, H4: 16 },
      contentFloors: { H1: 24, H2: 20, H3: 16, H4: 16 },
      componentFloors: { H1: 24, H2: 18, H3: 15, H4: 15 },
      maxLines: { H1: 4, H2: 4, H3: 4, H4: 5 },
      bodyFloor: 14,
    },
  }[viewport.mobile ? 'sp' : 'pc'];

  return `(() => {
    const settings = ${JSON.stringify(settings)};
    const viewport = ${JSON.stringify(viewport)};
    const rootSelector = ${JSON.stringify(scopedToIntro ? '#introHook,#methodIntro,#methodIntroBalance,#methodCompare' : '')};
    const roots = rootSelector ? [...document.querySelectorAll(rootSelector)] : [document];
    const queryAll = selector => roots.flatMap(root => [...root.querySelectorAll(selector)]);
    const ignoredCopy = [
      'small',
      '.u-visually-hidden',
      '[aria-hidden="true"]',
      '[class$="__note"]',
      '[class*="__note-"]',
      '[class$="__label"]',
      '[class$="__caption"]',
      '[class$="__eyebrow"]',
      '[class$="__badge"]',
      '.humidity-compare__temp'
    ].join(',');
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const sectionName = (section, index) => section.id || section.classList[0] || 'section-' + (index + 1);
    const targetName = element => {
      if(element.id) return '#' + element.id;
      const classes = [...element.classList].filter(name => !name.startsWith('reveal') && name !== 'is-shown');
      return element.tagName.toLowerCase() + (classes[0] ? '.' + classes[0] : '');
    };
    const lineBoxes = element => {
      const boxes = [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while(walker.nextNode()){
        const node = walker.currentNode;
        if(!node.textContent.trim()) continue;
        const parent = node.parentElement;
        if(parent.closest('small,[aria-hidden="true"]')) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for(const rect of range.getClientRects()){
          if(rect.width < 1 || rect.height < 1) continue;
          const center = rect.top + rect.height / 2;
          const existing = boxes.find(box =>
            Math.abs((box.top + box.bottom) / 2 - center) < Math.max(box.height, rect.height) * .6);
          if(existing){
            existing.left = Math.min(existing.left, rect.left);
            existing.right = Math.max(existing.right, rect.right);
            existing.top = Math.min(existing.top, rect.top);
            existing.bottom = Math.max(existing.bottom, rect.bottom);
            existing.height = existing.bottom - existing.top;
            existing.width = existing.right - existing.left;
          }else{
            boxes.push({
              top: rect.top,
              bottom: rect.bottom,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              width: rect.width
            });
          }
        }
      }
      return boxes.sort((a, b) => a.top - b.top);
    };
    const sections = rootSelector ? roots : queryAll('section');
    sections.forEach((section, index) => section.dataset.layoutAuditIndex = String(index));
    const panels = queryAll('[data-layout-panel]');
    panels.forEach((panel, index) => panel.dataset.layoutAuditPanelIndex = String(index));
    const sectionData = sections.map((section, index) => ({
      index,
      name: sectionName(section, index),
      top: Math.round(section.getBoundingClientRect().top + scrollY),
      width: Math.round(section.getBoundingClientRect().width),
    }));
    const panelData = panels.map((panel, index) => {
      const section = panel.closest('section') || sections[0];
      const panelClass = [...panel.classList].find(name => name !== 'lp-story-panel' && !name.startsWith('reveal'));
      return {
        index,
        name: panelClass || 'panel-' + (index + 1),
        section: sectionName(section, sections.indexOf(section)),
        sectionIndex: sections.indexOf(section),
        top: Math.round(panel.getBoundingClientRect().top + scrollY),
      };
    });
    const errors = [];
    const warnings = [];
    const push = (list, code, element, section, message, detail = {}) => {
      const rect = element.getBoundingClientRect();
      list.push({
        code,
        section: sectionName(section, sections.indexOf(section)),
        sectionIndex: sections.indexOf(section),
        panelIndex: panels.indexOf(element.closest('[data-layout-panel]')),
        target: targetName(element),
        message,
        y: Math.round(rect.top + scrollY),
        ...detail,
      });
    };

    const overflow = rootSelector ? 0 : document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if(overflow > 1){
      errors.push({
        code: 'page-horizontal-overflow',
        section: 'document',
        sectionIndex: 0,
        target: 'html',
        message: 'ページが横に ' + overflow + 'px はみ出しています。',
        y: 0,
        overflow,
      });
    }

    for(const heading of queryAll('h1,h2,h3,h4')){
      if(!visible(heading) || heading.closest('.u-visually-hidden')) continue;
      const section = heading.closest('section') || sections[0];
      const style = getComputedStyle(heading);
      const fontSize = Number.parseFloat(style.fontSize);
      const lines = lineBoxes(heading);
      const isComponent = Boolean(heading.closest('article,li,.lp-card,.qa__item,[role="dialog"]'));
      const labelledBy = (section.getAttribute('aria-labelledby') || '').split(/\\s+/);
      const firstHeading = section.querySelector('h1,h2,h3,h4');
      const isSectionHeading = labelledBy.includes(heading.id) || heading === firstHeading;
      const floorSet = isComponent
        ? settings.componentFloors
        : isSectionHeading ? settings.sectionFloors : settings.contentFloors;
      const floor = floorSet[heading.tagName];
      const maxLines = settings.maxLines[heading.tagName];
      if(fontSize < floor){
        push(errors, 'heading-too-small', heading, section,
          heading.tagName.toLowerCase() + ' が ' + fontSize.toFixed(1) + 'px です（下限 ' + floor + 'px）。',
          { fontSize, floor, lines: lines.length });
      }
      if(!isComponent && lines.length > maxLines){
        push(errors, 'heading-too-many-lines', heading, section,
          '見出しが ' + lines.length + ' 行あります（上限 ' + maxLines + ' 行）。',
          { fontSize, lines: lines.length, maxLines });
      }
      if(lines.length > 1){
        const widest = Math.max(...lines.map(line => line.width));
        const lastRatio = widest ? lines.at(-1).width / widest : 1;
        if(!isComponent && lastRatio < .34){
          const list = heading.tagName === 'H4' ? warnings : errors;
          push(list, 'heading-orphan-line', heading, section,
            '見出しの最終行が短すぎます（最長行の ' + Math.round(lastRatio * 100) + '%）。',
            { fontSize, lines: lines.length, lastLineRatio: lastRatio });
        }
      }
      const sectionRect = section.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      if(viewport.name === 'pc' && !isComponent && lines.length >= 3 && headingRect.width < 560){
        push(errors, 'heading-in-narrow-column', heading, section,
          '連続して読む見出しが狭いカラム内で ' + lines.length + ' 行に分断されています。',
          { lines: lines.length, headingWidth: headingRect.width, sectionWidth: sectionRect.width });
      }
      if(viewport.name === 'pc'){
        const forcedBreaks = [...heading.querySelectorAll('br:not(.br-sp)')]
          .filter(br => getComputedStyle(br).display !== 'none').length;
        if(forcedBreaks){
          push(warnings, 'pc-forced-heading-break', heading, section,
            'PC見出し内に通常のbrが ' + forcedBreaks + ' 個あります。',
            { forcedBreaks, fontSize, lines: lines.length });
        }
      }
    }

    for(const panel of panels){
      if(!visible(panel)) continue;
      const section = panel.closest('section') || sections[0];
      const roles = [...panel.querySelectorAll('[data-type-role]')]
        .filter(element => element.closest('[data-layout-panel]') === panel && visible(element));
      const mains = roles.filter(element => element.dataset.typeRole === 'main');
      if(mains.length !== 1){
        push(errors, 'panel-main-count', panel, section,
          '1panelの主役は1つだけ必要です（現在 ' + mains.length + ' 個）。',
          { mainCount: mains.length });
        continue;
      }
      const main = mains[0];
      const mainStyle = getComputedStyle(main);
      const mainSize = Number.parseFloat(mainStyle.fontSize);
      const mainWeight = Number.parseInt(mainStyle.fontWeight, 10) || 400;
      for(const element of roles){
        if(element === main) continue;
        const role = element.dataset.typeRole;
        if(role === 'evidence') continue;
        const style = getComputedStyle(element);
        const size = Number.parseFloat(style.fontSize);
        const weight = Number.parseInt(style.fontWeight, 10) || 400;
        const ratio = mainSize ? size / mainSize : 0;
        if(weight >= 600 && ratio >= .92){
          push(errors, 'panel-competing-emphasis', element, section,
            role + ' が主見出しと同等の強さです（サイズ比 ' + ratio.toFixed(2) + '）。',
            { role, mainSize, fontSize: size, mainWeight, fontWeight: weight, sizeRatio: ratio });
        }
        if(role === 'close' && ratio >= .9){
          push(errors, 'panel-close-too-strong', element, section,
            '締めが主見出しと同等以上に見えます（サイズ比 ' + ratio.toFixed(2) + '）。',
            { mainSize, fontSize: size, sizeRatio: ratio });
        }
        if((role === 'lead' || role === 'support') && ratio >= .76){
          push(errors, 'panel-hierarchy-too-flat', element, section,
            role + ' と主見出しのサイズ差が不足しています（サイズ比 ' + ratio.toFixed(2) + '）。',
            { role, mainSize, fontSize: size, sizeRatio: ratio });
        }
      }
    }

    for(const copy of queryAll('p,li')){
      if(!visible(copy) || copy.closest(ignoredCopy) || copy.closest('h1,h2,h3,h4')) continue;
      if(copy.textContent.trim().length < 8) continue;
      const fontSize = Number.parseFloat(getComputedStyle(copy).fontSize);
      if(fontSize >= settings.bodyFloor) continue;
      const section = copy.closest('section') || sections[0];
      push(warnings, 'body-copy-too-small', copy, section,
        '本文が ' + fontSize.toFixed(1) + 'px です（推奨下限 ' + settings.bodyFloor + 'px）。',
        { fontSize, floor: settings.bodyFloor });
    }

    return {
      viewport,
      page: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      },
      sections: sectionData,
      panels: panelData,
      errors,
      warnings,
    };
  })()`;
}

function safeName(value){
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

let staticServer;
let edge;
let cdp;
try{
  staticServer = await startStaticServer();
  const staticPort = staticServer.address().port;
  const cdpPort = await freePort();
  edge = spawn(findEdge(), [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--hide-scrollbars',
    '--no-first-run',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${edgeProfile}`,
    'about:blank',
  ], { stdio: 'ignore' });
  const target = await waitForTarget(cdpPort);
  cdp = connectCdp(target.webSocketDebuggerUrl);
  await cdp.open;
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const reports = [];
  for(const viewport of VIEWPORTS){
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    });
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${staticPort}/${encodeURI(page)}` });
    await wait(2500);
    await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        await document.fonts.ready;
        document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-shown'));
        await new Promise(resolve => setTimeout(resolve, 900));
        return true;
      })()`,
    });
    const evaluation = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: auditExpression(viewport, introOnly),
    });
    if(!evaluation.result?.value){
      const detail = evaluation.exceptionDetails?.exception?.description
        || evaluation.exceptionDetails?.text
        || '監査結果を取得できませんでした。';
      throw new Error(`[${viewport.name}] ${detail}`);
    }
    const report = evaluation.result.value;
    reports.push(report);

    const requestedPanels = report.panels.filter(panel =>
      captureIds.includes(panel.section) || captureIds.includes(panel.name));
    const failedPanels = report.panels.filter(panel =>
      report.errors.some(error => error.panelIndex === panel.index));
    const panelScreenshots = [...new Map([...requestedPanels, ...failedPanels].map(panel => [panel.index, panel])).values()];
    for(const panel of panelScreenshots){
      await cdp.send('Runtime.evaluate', {
        expression: `document.querySelector('[data-layout-audit-panel-index="${panel.index}"]').scrollIntoView({block:'start'})`,
      });
      await wait(150);
      const capture = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const file = `${viewport.name}-panel-${String(panel.index + 1).padStart(2, '0')}-${safeName(panel.name)}.png`;
      writeFileSync(join(outputDir, file), Buffer.from(capture.data, 'base64'));
    }
    const requestedSections = report.sections.filter(section =>
      captureIds.includes(section.name) && !report.panels.some(panel => panel.sectionIndex === section.index));
    const failedSections = report.sections.filter(section =>
      report.errors.some(error => error.sectionIndex === section.index && error.panelIndex < 0));
    const sectionScreenshots = [...new Map([...requestedSections, ...failedSections].map(section => [section.index, section])).values()];
    for(const section of sectionScreenshots){
      await cdp.send('Runtime.evaluate', {
        expression: `document.querySelector('[data-layout-audit-index="${section.index}"]').scrollIntoView({block:'start'})`,
      });
      await wait(150);
      const capture = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const file = `${viewport.name}-section-${String(section.index + 1).padStart(2, '0')}-${safeName(section.name)}.png`;
      writeFileSync(join(outputDir, file), Buffer.from(capture.data, 'base64'));
    }
  }

  const totals = reports.reduce((result, report) => ({
    errors: result.errors + report.errors.length,
    warnings: result.warnings + report.warnings.length,
  }), { errors: 0, warnings: 0 });
  const result = { generatedAt: new Date().toISOString(), outputDir, totals, reports };
  writeFileSync(join(outputDir, 'report.json'), JSON.stringify(result, null, 2));

  for(const report of reports){
    console.log(`\n[${report.viewport.name}] ${report.viewport.width}x${report.viewport.height}: ${report.errors.length} errors, ${report.warnings.length} warnings`);
    for(const issue of report.errors) console.log(`  ERROR ${issue.code} ${issue.section} ${issue.target}: ${issue.message}`);
    for(const issue of report.warnings) console.log(`  WARN  ${issue.code} ${issue.section} ${issue.target}: ${issue.message}`);
  }
  console.log(`\nReport: ${join(outputDir, 'report.json')}`);
  console.log(`Screenshots: ${outputDir}`);
  if(totals.errors && !reportOnly) process.exitCode = 1;
}finally{
  cdp?.close();
  if(edge && !edge.killed){
    edge.kill();
    await wait(750);
  }
  if(staticServer) await new Promise(resolveClose => staticServer.close(resolveClose));
  try{
    rmSync(edgeProfile, { recursive: true, force: true });
  }catch(error){
    if(error?.code !== 'EBUSY') throw error;
    await wait(1250);
    rmSync(edgeProfile, { recursive: true, force: true });
  }
}
