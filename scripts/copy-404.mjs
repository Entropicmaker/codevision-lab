/**
 * GitHub Pages SPA 回退：把 index.html 复制为 404.html。
 * 用户直接访问/刷新子路由（如 /algorithms/bubble-sort）时，
 * GitHub Pages 返回 404.html，内容与 index.html 一致，
 * React Router 按当前 pathname 恢复正确页面。
 */
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('✓ dist/404.html 已生成（SPA 路由回退）');
