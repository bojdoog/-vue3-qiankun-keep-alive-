# 关于在 vue3 中对 qiankun 子程序的缓存（基于 keep-alive 的原理,存放在内存中）

## 使用方法

```
将render.js文件放到App.vue同一级目录下

在main.js中，从render.js中引入{render,_unmount},在暴漏出去的mount和unmount方法中分别调用render()和_unmount()方法
```

## 具体示例(main.js 文件)

```
import { render, _unmount } from "./render";

const isMicroApp = !!window.__POWERED_BY_QIANKUN__;
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

export async function bootstrap() {
  console.log("react app bootstraped");
}

export async function mount(props) {
  render();
}

export async function unmount() {
  _unmount();
}
!isMicroApp && render();

```
