百度云 cdn 地址添加 x-bce-process=image/format,f_auto 后，可以帮助我们把图片转为 webp，但是百度云不支持转换 avif 格式的图片。
但是百度云 cdn 有一个边缘服务器，可以自定义 cdn 的一些规则。所以我们可以先上传一些 avif 图片，访问 jpg 的时候，在边缘服务器中返回 avif。那图片从哪里上传呢？
配置 robot-ui 中的裁切组件，上传一张 jpg 的图，裁切组件会根据 jpg 生成对应的 webp 和 avif，然后根据一定的文件名规则一起上传到百度云的桶里面，

边缘处理原则：

- 在符合文件名规则的情况下用户上传了 webp/avif，则使用用户上传的图片；否则使用百度云图片处理能力，也就是添加图片处理参数 x-bce-process=image/format,f_auto
- 只处理原图格式为 png/jpg/jpeg 格式的图片
- 如何用户自身携带了 x-bce-process=image/format,f_auto 参数，就不处理了
- 如果 avif/webp 都支持，优先返回 avif，其次返回 webp
- 如果浏览器不支持 avif，优先返回 webp，如果浏览器不支持 webp，返回原图
