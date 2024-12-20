问题
智子 APP 使用腾讯 X5 内核，偶尔会加载失败，导致 APP 使用默认浏览器。如果默认浏览器版本太低，就会导致一些新语法无法使用，产生报错。比如 replaceAll 方法。
加载失败：
在 oppo 测试机上，每次重装之后，第一次打开会发生加载失败。
此后每次打开都不会出现加载失败的情况。
报错原因分析
1 、replaceAll 方法在 chrome 上是 85 版本支持的。
[图片]
2、如果 X5 内核加载成功，那么对应的 chrome 版本为 89，此方法没有问题。
如果 X5 内核加载失败，那么对应的 chrome 版本为 74，此时不支持此方法，产生了报错。
[图片]

[图片]

解决方法
默认情况下，Vite 的目标是能够 支持原生 ESM script 标签、支持原生 ESM 动态导入 和 import.meta 的浏览器：

- Chrome >=87
- Firefox >=78
- Safari >=14
- Edge >=88
  你也可以通过 build.target 配置项 指定构建目标，最低支持 es2015。
  请注意，默认情况下 Vite 只处理语法转译，且 不包含任何 polyfill。

在配置 vite.config.ts 中，设置 target: 'es2015'， 也只能最低兼容 87 版本的。
所以需要其他方式来兼容更低版本。

传统浏览器可以通过插件 @vitejs/plugin-legacy 来支持，它将自动生成传统版本的 chunk 及与其相对应 ES 语言特性方面的 polyfill。
// build/vite/plugin/index.ts

import legacy from '@vitejs/plugin-legacy'

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
// ...

const vitePlugins: Array<PluginOption> = [...]

// 增加下面这些代码
vitePlugins.push(
legacy({
// ======= 这里是整体配置 =======
// 设置打包支持的浏览器版本
// targets: ['chrome 52', 'not IE 11'],

      // 强制让现代浏览器（支持esModule的浏览器）支持所有新语法，增加89k的polyfill文件
      // modernPolyfills: true,

      // vite默认为true
      renderLegacyChunks: true,

      // ======= 以下是对于方法单独配置 =======
      // 让现代浏览器支持replaceAll方法
      modernPolyfills: ['es.string.replace-all'],
      // 让旧版本浏览器可以支持replaceAll方法
      polyfills: ['es.string.replace-all'],
    }),

)

// ...
return vitePlugins
}

属性解释：
1 、targets： 默认'last 2 versions and not dead, > 0.3%, Firefox ESR'，可以设置 es2020 或者 chrome52 等形式，如果设置为 chrome52，则代码会被打包成 chrome52 所支持的格式。
2、renderLegacyChunks: true。
如果设置为 false，则不会打包 nomodule 的文件。（具体可以看最后的打包产物）。
3、modernPolyfills: true （打包产物 89k）
强制让现代浏览器（支持 esModule 的浏览器）支持所有新语法，官方说法是增加 15k 左右的 polyfill 文件，实际打包大小为 89k。
当这个属性为 false 的时候，对于现代浏览器，没有打包 polyfill 产物去支持 replaceAll 语法。
对于上面的报错，因为 chrome74 是支持 ESM 的，所以不会加载 legacy 代码。但是 chrome74 又不支持 replaceAll，导致 replaceAll 报错了。（具体可以看最后的打包产物）。
4、modernPolyfills: ['es.string.replace-all'], （打包产物 12k）
单独设置，针对现代浏览器，打包只支持 replaceAll 的 polyfill 产物。这样可以节省打包大小。
5、polyfills: ['es.string.replace-all'],
单独设置，针对传统浏览器，打包只支持 replaceAll 的 polyfill 产物。(无法测试，没有低版本的浏览器)

可以参考这两篇文章，了解如何针对某些方法单独设置。
https://github.com/vitejs/vite/tree/main/packages/plugin-legacy （官网）
https://zhuanlan.zhihu.com/p/583090553
https://blog.csdn.net/weixin_46037781/article/details/125526769
[图片]
[图片]
报错解决过程
[图片]
legacy({
targets: ['chrome 52', 'not IE 11'],
})
使用这种方式打包，产生了 legacy 文件，如果是传统浏览器，那么也不会报错。
但是这个是现代浏览器，可以从代码中看到，并没有加载 legacy.js。

[图片]
legacy({
// 让现代浏览器支持 replaceAll 方法
modernPolyfills: ['es.string.replace-all'],
// 让旧版本浏览期可以支持 replaceAll 方法
polyfills: ['es.string.replace-all'],
}),
使用这个方式打包，可以产生一个 polyfill 文件来支持 replaceAll。使得不支持 replaceAll 的现代浏览器能够支持。

<script type="module" crossorigin src="/order/assets/polyfills.9e696ecf.js"></script>

打包产物：根据配置不同产生的 index.html
targets: 'last 2 versions and not dead, > 0.3%, Firefox ESR'
renderLegacyChunks: true

<!doctype html>
<html lang="en" id="htmlRoot">
  
  <head>
    <script src="/order/_app.config.js?v=0.0.1-1704941085073"></script>
    <meta charset="UTF-8" />
    <meta name="renderer" content="webkit" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,viewport-fit=cover"
    />
    <title>
      极越订单平台
    </title>
    <link rel="icon" type="image/png" href="https://static.jiduapp.cn/optimus/user-upload/53a07dd6a6.png"
    />
    <van-nav-bar safe-area-inset-top/>
    <van-number-keyboard safe-area-inset-bottom/>
    <script type="module" crossorigin src="/order/assets/index.a722daa9.js"></script>
    <link rel="stylesheet" href="/order/assets/index.532a3aef.css">
    <script type="module">
      import.meta.url;
      import("_").
      catch(() = >1); (async
      function * () {})().next();
      if (location.protocol != "file:") {
        window.__vite_is_modern_browser = true
      }
    </script>
    <script type="module">
      !
      function() {
        if (window.__vite_is_modern_browser) return;
        console.warn("vite: loading legacy chunks, syntax error above and the same error below should be ignored");
        var e = document.getElementById("vite-legacy-polyfill"),
        n = document.createElement("script");
        n.src = e.src,
        n.onload = function() {
          System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))
        },
        document.body.appendChild(n)
      } ();
    </script>
  </head>
  
  <body>
    <div id="app"></div>
    <script nomodule>
      !
      function() {
        var e = document,
        t = e.createElement("script");
        if (! ("noModule" in t) && "onbeforeload" in t) {
          var n = !1;
          e.addEventListener("beforeload", (function(e) {
            if (e.target === t) n = !0;
            else if (!e.target.hasAttribute("nomodule") || !n) return;
            e.preventDefault()
          }), !0),
          t.type = "module",
          t.src = ".",
          e.head.appendChild(t),
          t.remove()
        }
      } ();
    </script>
    <script nomodule crossorigin id="vite-legacy-polyfill" src="/order/assets/polyfills-legacy-af2193fa.js"></script>
    <script nomodule crossorigin id="vite-legacy-entry" data-src="/order/assets/index-legacy-beb2ebd1.js">
      System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))
    </script>
  </body>

</html>
targets: ['chrome 52', 'not IE 11'],
renderLegacyChunks: true
<!doctype html>
<html lang="en" id="htmlRoot">
  <head>
    <script src="/order/_app.config.js?v=0.0.1-1704701981084"></script>
    <meta charset="UTF-8"/>
    <meta name="renderer" content="webkit"/>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,viewport-fit=cover"/>
    <title>极越订单平台</title>
    <link rel="icon" type="image/png" href="https://static.jiduapp.cn/optimus/user-upload/53a07dd6a6.png"/>
    <van-nav-bar safe-area-inset-top/>
    <van-number-keyboard safe-area-inset-bottom/>
    
    <script type="module" crossorigin src="/order/assets/index.cc451094.js"></script>
    <link rel="stylesheet" href="/order/assets/index.532a3aef.css">
    <script type="module">import.meta.url;import("_").catch(()=>1);(async function*(){})().next();if(location.protocol!="file:"){window.__vite_is_modern_browser=true}</script>
    <script type="module">!function(){if(window.__vite_is_modern_browser)return;console.warn("vite: loading legacy chunks, syntax error above and the same error below should be ignored");var e=document.getElementById("vite-legacy-polyfill"),n=document.createElement("script");n.src=e.src,n.onload=function(){System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))},document.body.appendChild(n)}();</script>
  </head>
  
  <body>
    <div id="app"></div>
    <script nomodule>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",(function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()}),!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>
    <script nomodule crossorigin id="vite-legacy-polyfill" src="/order/assets/polyfills-legacy-10c5c57e.js"></script>
    <script nomodule crossorigin id="vite-legacy-entry" data-src="/order/assets/index-legacy-cae664b1.js">System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))</script>
  </body>
</html>
targets: ['chrome 52', 'not IE 11'],
modernPolyfills: true,
renderLegacyChunks: true
<!doctype html>
<html lang="en" id="htmlRoot">
  <head>
    // 这一行是有区别的，让现代浏览器可以使用最新的语法
    <script type="module" crossorigin src="/order/assets/polyfills.cd76aedb.js"></script>
    <script src="/order/_app.config.js?v=0.0.1-1704701746244"></script>
    <meta charset="UTF-8"/>
    <meta name="renderer" content="webkit"/>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,viewport-fit=cover"/>
    <title>极越订单平台</title>
    <link rel="icon" type="image/png" href="https://static.jiduapp.cn/optimus/user-upload/53a07dd6a6.png"/>
    <van-nav-bar safe-area-inset-top/>
    <van-number-keyboard safe-area-inset-bottom/>
    <script type="module" crossorigin src="/order/assets/index.cc451094.js"></script>
    <link rel="stylesheet" href="/order/assets/index.532a3aef.css">
    <script type="module">import.meta.url;import("_").catch(()=>1);(async function*(){})().next();if(location.protocol!="file:"){window.__vite_is_modern_browser=true}</script>
    <script type="module">!function(){if(window.__vite_is_modern_browser)return;console.warn("vite: loading legacy chunks, syntax error above and the same error below should be ignored");var e=document.getElementById("vite-legacy-polyfill"),n=document.createElement("script");n.src=e.src,n.onload=function(){System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))},document.body.appendChild(n)}();</script>
  </head>
  <body>
    <div id="app"></div>
    <script nomodule>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",(function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()}),!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>
    <script nomodule crossorigin id="vite-legacy-polyfill" src="/order/assets/polyfills-legacy-10c5c57e.js"></script>
    <script nomodule crossorigin id="vite-legacy-entry" data-src="/order/assets/index-legacy-cae664b1.js">System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))</script>
  </body>
</html>

modernPolyfills: ['es.string.replace-all'],
renderLegacyChunks: false,

<!doctype html>
<html lang="en" id="htmlRoot">
  
  <head>
    <script type="module" crossorigin src="/order/assets/polyfills.9e696ecf.js"></script>
    <script src="/order/_app.config.js?v=0.0.1-1704940003362"></script>
    <meta charset="UTF-8" />
    <meta name="renderer" content="webkit" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,viewport-fit=cover"
    />
    <title>
      极越订单平台
    </title>
    <link rel="icon" type="image/png" href="https://static.jiduapp.cn/optimus/user-upload/53a07dd6a6.png"
    />
    <van-nav-bar safe-area-inset-top/>
    <van-number-keyboard safe-area-inset-bottom/>
    <script type="module" crossorigin src="/order/assets/index.a722daa9.js"></script>
    <link rel="stylesheet" href="/order/assets/index.532a3aef.css"></head>
  
  <body>
    <div id="app"></div>
    // 这里的legacy块不会再打包
  </body>

</html>

type=module 和 nomodule
JavaScript 语言诞生至今，模块规范化之路在曲折中前进。前端社区先后出现了各种解决方案： AMD、CMD、CommonJS 等，而后 ECMA 组织在 JavaScript 语言标准层面，增加了模块功能 ESM（因为该功能是在 ES2015 版本引入的，所以也被称为 ES6 module）
模块化规范介绍链接：https://article.juejin.cn/post/7008727517716545550

1、如果浏览器支持 ESM 规范（简单理解为支持 ES6），会默认加载 type=module 的 script 标签，自动忽略 nomodule 标签。这时候即使打包了 legacy 的包也没有用。
2、如果浏览器不支持，那么会加载 nomodule 的 script 标签。这时候会加载 legacy.js。

总结
如果需要兼容传统浏览器，一般可以设置 targets: ['chrome52']等方式，使得新语法能被老的浏览器支持，缺点是打包产物比较大。

如果现代浏览器不支持某些方法，建议根据使用情况单独增加 modernPolyfills: ['es.string.replace-all'] 等属性，使得打包产物包含对应 polyfill 文件，同时控制打包的大小。

常见属性：
'es.symbol',
'es.array.filter',
'es.promise',
'es.promise.finally',
'es/map',
'es/set',
'es.array.for-each',
'es.object.define-properties',
'es.object.define-property',
'es.object.get-own-property-descriptor',
'es.object.get-own-property-descriptors',
'es.object.keys',
'es.object.to-string',
'web.dom-collections.for-each',
'esnext.global-this',
'esnext.string.match-all',
'es.string.replace-all'
