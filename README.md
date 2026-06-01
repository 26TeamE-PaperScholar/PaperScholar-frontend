# Papaer-Scholar

## 说明

### 0 快速启动

```bash
npm ci
npm run dev
```

本地运行需要 Node.js 16 或更新版本，推荐 18/20 LTS。真实后端联调请确保项目根目录 `.env.local` 中有 `VITE_USE_MOCK=false`。同行专家本地一键测试入口见 [expert-test/README.md](expert-test/README.md)，也可直接运行 `npm run expert:test`。

### 1 插件

- 路由 router，配置在`/src/router/index.js`中

- 状态管理 vuex，配置在`/src/store/index.js`中

  > 使用 vuex 时，必须把复杂的判断逻辑写在`actions`中，仅在`mutations`中处理数据。
  >
  > 访问 vuex 时，应使用 `mapState` `mapAction` `mapMutation`。

- 网络请求 http，配置在`/src/http/index.js`中

- 全剧事件总线 mitt，配置于`vm`身上的`$bus`，发送事件写`this.$bus.emit`，接收事件写`this.$bus.on`

- vue-cookies，配置于`vm`身上的`$cookies`

### 2 规范

1. **js 脚本不写分号。css 的每一个样式表中，最后一个`key: value`后写分号。**

   > **注意：**通过`log+回车`、`set+回车`、`import+回车`快捷生成代码时，vscode 会自动加上分号，**必须删掉**。

2. **任何能用单引号的地方就不用双引号。**

3. 数组或对象的最后一个成员后不写逗号，例如

   ```js
   let arr = [ // <- 第一个成员的'{'不要出现在这里
       {
           name: 'Tom',
           age: 18 // <- 这里不要有逗号
       },
       {
           name: 'Jane',
           age: 20 // <- 这里不要有逗号
       } // <- 这里不要有逗号
   ]
   ```

4. 插值语法等出现`{}`的地方，花括号首尾都必须有一个空格，例如

   ```js
   import { mapState } from 'vuex'
   //      ^        ^
   ```

5. `views`和`components`中的`.vue`文件，**按照`template` `script` `style`的顺序写（vscode 快捷键：`<v` + 回车）**，**style 标签必须写 `scoped`**。

6. **单标签必须自结束**，例如应写`<div><input /></div>`而非`<div><input></div>`。组件标签必须用**驼峰命名**的写法，例如应写`<VueAdvancedChat />`而非`<vue-advanced-chat />`，当然，对于没有插槽的单标签组件，标签同样必须自结束。

7. 除`App.vue`外的`.vue`文件，不应直接隶属于`views`或`components`，**必须再套一层目录**，哪怕该目录中只有一个文件。

8. 设置 vscode 默认缩进 **2 空格**。

9. vue 语法支持的函数调用，不传参数时不写括号，例如，应写`@click="handleClick"`而非`@click="handleClick()"`

10. 标签中既有原生属性、又有 vue 语法时，原生放前面。**例外是，可以把`ref`放在最前面。**

    ```vue
    <!-- 这么写 -->
    <div class="card-item" v-for="item in items" :key="item.id"></div>
    
    <!-- 而不是这么写 -->
    <div v-for="item in items" :key="item.id" class="card-item"></div>
    ```

    标签有一坨属性时，分行写，标签的左尖括号和标签名独占一行，右尖括号独占一行，例如

    ```vue
    <div
      class="card-item" style="padding-left: 10px"
      v-for="item in items" :key="item.id"
      @click="alertMessage(item.msg)"
      @mouseover="handleHover" @mouseleave="handleUnhover"
    >
      内容
    </div>
    ```

11. 组件脚本采用 vue2 写法，**不使用 vue3 的`setup`函数**。

### 3 Candy

- #### 悬浮提示`v-tooltip`

  在一个双标签元素上加上这个指令，可以指定一个悬浮时的气泡提示。例如

  ```vue
  <button v-tooltip="'点我'">Click Me</button>
  ```

  效果就是按钮文字内容为“Click Me”，悬浮时会有气泡提示，内容为“点我”**。注意指令的双引号内部必须包单引号。**

### 4 重置样式

`/public/css/reset.css`已经清除了绝大多数元素的**默认样式**，如各级`h`标题的粗细和大小、`a`标签的颜色、`ul` `li`的小圆点等。

该文件引入于`/index.html`。

### 5 默认样式（持续更新）

`/public/css/index.css`设置了一些风格类型的样式，兹详述如下。

- #### 全局量

  - `--theme-mode`：颜色模式，白天 / 黑夜

  - `--theme-color`：强调色

    > `--theme-color-*`：不同透明度的强调色

- #### 按钮样式

  - 类选择器`.basic-btn`：具有一定圆角和默认大小的实心（即背景色填充了强调色、文字颜色与背景色形成对比）按钮。该按钮被悬浮时会发生一定颜色减淡变化。

  - 类选择器`.basic-btn-outline`：具有一定圆角和默认大小的空心（既背景色透明，边框和文字颜色为强调色）按钮。该按钮被悬浮时会发生一定颜色减淡变化。

- #### 输入框样式

  - 类选择器`.basic-input`：具有一定圆角和默认大小的输入框，输入框的边框和光标色都是强调色。该输入框被聚焦时边框会加粗。
  - 类选择器`.huge-input-wrapper`：巨大输入框的容器。大概率仅用一次，不详述。
  - 类选择器`.huge-input`：巨大输入框。大概率仅用一次，不详述。

- #### 其他

  - `v-tooltip`的样式
    - 动画`tooltip-zoomIn`：tooltip 出场动画
    - 动画`tooltip-zoomOut`：tooltip 离场动画
    - 类选择器`.tooltip-appear`：tooltip 出场样式
    - 类选择器`.tooltip-disappear`：tooltip 离场样式

### 6 设计系统（Premium Institution）

2026 年 5 月起接入了一套全新的设计语言："高端机构风"，深紫罗兰 + 学术金（Playfair Display + Inter + Noto SC）。它**完全向后兼容**老的 `.basic-btn` / `.basic-input` / `.huge-input` 等类名（已用新 token 重写），同时提供更现代的组件库。

- **Tokens** 在 [src/styles/tokens.css](src/styles/tokens.css) 集中声明：
  - 主色：`--ps-color-primary` (#2D1B69)、金强调：`--ps-color-accent` (#D4AF37)
  - 表面：`--ps-bg-page` / `--ps-bg-elevated` / `--ps-bg-sunken`
  - 文字：`--ps-text-1/2/3`、`--ps-text-inverse`
  - 边框：`--ps-border-1/2`
  - 状态：`--ps-color-success/warning/danger/info`（及 `*-soft` 变体）
  - 圆角：`--ps-radius-xs/sm/md/lg/xl/pill`
  - 间距：`--ps-space-1..10`（4-pt 网格）
  - 阴影：`--ps-shadow-1/2/3` + 主题专属 `--ps-shadow-violet/gold/focus`
  - 字体：`--ps-font-display/sans/mono`，字号 `--ps-fs-xs..6xl`
  - 动效：`--ps-motion-fast/base/slow`、`--ps-ease-out/in-out`
  - 布局：`--ps-nav-height` 64px、`--ps-content-max` 1280px

- **暗色模式**：在 `<html>` 上加 `data-theme="dark"` 即生效（NavBar 中的「月亮 / 太阳」图标会切换，并写入 `localStorage.ps-theme`），所有 token 在 `:root[data-theme='dark']` 下重新覆盖一遍，业务代码无需任何改动。

- **全局样式入口**：`src/main.js` 顶部 `import './styles/tokens.css'` + `import './styles/global.css'`，老的 `/css/index.css` 现在只是空文件占位（用于兼容直接 `<link>` 的外部资源）。

- **共享组件库** 位于 [src/components/ui/](src/components/ui)，导出通过 `import { AppCard, AppStat, ... } from '@/components/ui'`（或相对路径）：

  | 组件 | 作用 |
  | --- | --- |
  | `AppCard` | 统一卡片壳：`title/subtitle/header/actions/footer` 插槽，`elevation`/`hover`/`interactive`/`accent` props |
  | `AppIcon` | `@vicons/ionicons5` 包装，按 ionicons 类名即可使用（如 `Search`、`Bookmark`） |
  | `AppStat` | 大数字 + 单位 + 趋势小标签，展示常用 |
  | `AppTagChip` | 关键词/标签/学科芯片，6 种变体 `subtle/solid/outline/gold/success/warning/danger`，可点击/可删除 |
  | `AppMetricBadge` | 圆角小徽章（高被引、OA、IF…） |
  | `AppAvatar` | 圆形头像，无图片时根据 id 生成稳定渐变 + 首字母 |
  | `AppSectionHeader` | 二级标题 + 副标题 + 右侧 action |
  | `AppEmptyState` | 空状态：插画 + 文案 + actions slot |
  | `AppSkeleton` / `AppSkeletonCard` | 骨架屏（与 mock 的 220–520ms 延迟配合演示） |
  | `AppBreadcrumb` | 详情页面包屑 |
  | `AppGradientHero` | 深紫渐变 hero 区，`variant=dark/soft/gold` |
  | `AppKbdHint` | ⌘K 之类的快捷键贴片 |
  | `AppIconButton` | 圆形/方形图标按钮，含 tooltip |
  | `AppSparkline` | SVG 迷你折线，可放进 Stat / 列表项 |

- **图标命名**：直接使用 `@vicons/ionicons5` 的 ES 导出名（PascalCase）。例如 `<AppIcon name="FlameOutline" :size="14" />`。

### 7 后端与 Mock 数据模式

当前联调与专家测试以 **真实后端** 为主。前端请求统一通过 `src/http/index.js` 的 `baseURL: '/api'` 发起，本地开发时由 [vite.config.js](vite.config.js) 中的代理转发到后端联调地址。

- 真实后端：项目根目录 `.env.local` 中设置 `VITE_USE_MOCK=false`，或运行 `npm run expert:test` 自动写入该配置。
- Mock 备用：后端暂时不可用、或只想离线演示前端页面时，将 `.env.local` 改为 `VITE_USE_MOCK=true`，也可运行 `npm run expert:test -- --mock`。
- `src/mock/index.js` 集中导出 18 篇真实风格论文、15 位学者、10 所机构、10 种期刊、6 个主题、5 条系统消息、4 条审核记录等。
- `src/api/*.js` 中保留 `if (USE_MOCK) return mockResponse(...)` 分支，**方法签名与后端契约保持一致**，便于真实后端与离线演示模式切换。
- 模拟延时：`src/mock/delay.js` 默认 220–520ms 随机延时，骨架屏因此能正常展示。
- 想要扩充演示数据，往 `src/mock/papers.js` / `authors.js` / `institutions.js` 中追加即可，schema 注释见各文件顶部。

### 8 演示 / PK 检查清单

- 路由覆盖：`/`（首页）、`/search_result?search=&search_type=1`（论文检索）、`/paper_detail/W2024-001`（详情页）、`/scholar_portal/A001`（学者主页）、`/institution_detail/I001`（机构页）、`/tag_detail/C1`（学科）、`/personal_homepage`、`/message`、`/auth`、`/admin`
- 演示用账号：真实后端模式请使用后端已创建账号；mock 模式下任意邮箱密码登录即可，自动写 cookie，可直接体验关注/收藏/消息中心。
- 暗色模式：点 NavBar 月亮图标，所有页面同步切换。
- 多语言：点 NavBar 地球图标，中英切换 + 全屏淡入淡出过渡。
- ⌘K 快捷键：任何页面按 `Cmd+K` / `Ctrl+K` 自动聚焦顶栏检索框。
