import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const base = process.env.PREVIEW_URL || 'http://localhost:3001';
const output = path.resolve('.tmp');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(output, { recursive: true });
const browser = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${path.join(output, `preview-browser-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
const timeout = setTimeout(() => { browser.kill(); process.exit(1); }, 360000);
try {
  const browserUrl = await new Promise((resolve, reject) => {
    let log = '';
    browser.once('error', reject);
    browser.stderr.on('data', (chunk) => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) resolve(match[1]);
    });
    browser.once('exit', () => reject(new Error('Chrome exited before debugging started')));
  });
  const debugUrl = new URL(browserUrl);
  const tabs = await (await fetch(`http://${debugUrl.host}/json/list`)).json();
  socket = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const entry = pending.get(message.id);
    if (entry) {
      pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error.message));
      else entry.resolve(message.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  async function waitFor(expression) {
    for (let attempt = 0; attempt < 120; attempt++) {
      try {
        if (await evaluate(expression)) return;
      } catch {
        // Navigation may temporarily replace the document/execution context.
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(`Browser condition not met: ${expression}`);
  }
  async function screenshot(name) {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(output, name), Buffer.from(data, 'base64'));
  }
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base });
  await waitFor('document.body.innerText.includes("A place to grow in faith")');
  await screenshot('preview-home.png');
  await send('Page.navigate', { url: `${base}/login` });
  await waitFor('Boolean(document.querySelector("#email"))');
  // Wait for Next.js to hydrate the form before sending real keyboard input.
  await waitFor('Object.keys(document.querySelector("#email")).some(key => key.startsWith("__reactProps"))');
  await evaluate('document.querySelector("#email").focus()');
  await send('Input.insertText', { text: 'superadmin@church.test' });
  await evaluate('document.querySelector("#password").focus()');
  await send('Input.insertText', { text: 'Test@1234' });
  await evaluate('document.querySelector("button[type=submit]").click()');
  await waitFor('location.pathname === "/account" && document.body.innerText.includes("Welcome, Member")');
  await screenshot('preview-account.png');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'Member dashboard overflows horizontally');
  await evaluate('Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Sign out").click()');
  await waitFor('location.pathname === "/login"');
  console.log('PASS browser login, account view and logout');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: base });
  await waitFor('document.body.innerText.includes("A place to grow in faith")');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'Mobile page overflows horizontally');
  await screenshot('preview-mobile.png');
  console.log('PASS mobile viewport; screenshots saved in .tmp');
} finally {
  clearTimeout(timeout);
  socket?.close();
  browser.kill();
}
