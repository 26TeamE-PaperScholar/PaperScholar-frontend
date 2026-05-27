<template>
  <div>
    <div ref="graphContainer" class="my-graph">
      <RelationGraph
        ref="graphRef"
        :options="graphOptions"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick"
      />
    </div>
  </div>
</template>

<script>
import RelationGraph from "relation-graph/vue3";
import { scholarPortalPath } from "../../utils/personal-page.mjs";

// 节点尺寸策略：
// - 以一个统一的“基准直径”渲染所有圆，使整体观感整齐；
// - 当名字过长时，仅在必要时小幅放大圆（最多到 MAX 直径），避免短名字显得空旷；
// - 仍超出上限的，做截断并保留全名以便后续 tooltip 等扩展使用。
const MIN_NODE_SIZE = 76;
const BASE_NODE_SIZE = 96;
const MAX_NODE_SIZE = 128;
const ROOT_NODE_SIZE = 140;
const CHAR_PX = 7.6;
const LINE_HEIGHT_PX = 18;
const MAX_CHARS_PER_LINE = 12;

export default {
  name: "AuthorRelationGraph",
  components: { RelationGraph },
  props: ["relationList"],
  data() {
    return {
      graphOptions: {
        debug: false,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultLineShape: 1,
        defaultJunctionPoint: "border",
        backgroundColor: "transparent",
        defaultLineWidth: 3,
        defaultNodeColor: "var(--theme-mode)",
        defaultNodeBorderWidth: 2,
        defaultNodeBorderColor: "var(--theme-color)",
        defaultNodeFontColor: "var(--default-text-color)",
        defaultNodeShape: 0,
        defaultNodeWidth: BASE_NODE_SIZE,
        defaultNodeHeight: BASE_NODE_SIZE,
        checkedLineColor: "var(--theme-color)",
        checkedNodeColor: "var(--theme-color)",
        defaultFocusRootNode: true,
        moveToCenterWhenRefresh: true,
        zoomToFitWhenRefresh: true,
        useAnimationWhenRefresh: false,
        // 中心放射布局：根节点位于中心，其他节点环绕；天然居中且确定性强，
        // 不需要等 force 仿真收敛，可避免「初始 10% 缩放且偏左上」的问题
        layout: {
          layoutName: "center",
          centerOffset_x: 0,
          centerOffset_y: 0,
          distance_coefficient: 1.15,
          fixedRootNode: true,
        },
      },
      // 是否已经向 setJsonData 推过数据；用于在尺寸第一次变成非 0 时重新触发 fit
      hasInjectedData: false,
      resizeObserver: null,
      fitTimer: null,
    };
  },
  watch: {
    relationList: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.scheduleRender();
        }
      },
    },
  },
  mounted() {
    // 监听容器尺寸：当所在 tab 由 display:none 切到可见，会从 0 变成实际尺寸
    if (typeof ResizeObserver !== "undefined" && this.$refs.graphContainer) {
      this.resizeObserver = new ResizeObserver(() => this.onContainerResize());
      this.resizeObserver.observe(this.$refs.graphContainer);
    }
    window.addEventListener("resize", this.onContainerResize);

    if (this.relationList && this.relationList.length > 0) {
      this.scheduleRender();
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener("resize", this.onContainerResize);
    if (this.fitTimer) {
      clearTimeout(this.fitTimer);
      this.fitTimer = null;
    }
    const graph = this.$refs.graphRef;
    if (graph && typeof graph.getInstance === "function") {
      const instance = graph.getInstance();
      if (instance && typeof instance.stopAutoLayout === "function") {
        instance.stopAutoLayout();
      }
    }
  },
  methods: {
    truncateLine(line) {
      if (line.length <= MAX_CHARS_PER_LINE) return line;
      return line.slice(0, MAX_CHARS_PER_LINE - 1) + "…";
    },
    formatNodeText(name) {
      if (!name) return "";
      const trimmed = String(name).trim();
      const tokens = trimmed.split(/\s+/);
      if (tokens.length === 1) {
        return this.truncateLine(trimmed);
      }
      const mid = Math.ceil(tokens.length / 2);
      let line1 = tokens.slice(0, mid).join(" ");
      let line2 = tokens.slice(mid).join(" ");
      line1 = this.truncateLine(line1);
      line2 = this.truncateLine(line2);
      return `${line1}\n${line2}`;
    },
    computeNodeSize(displayText) {
      const lines = displayText.split("\n");
      const longestChars = lines.reduce((m, l) => Math.max(m, l.length), 0);
      const textWidth = longestChars * CHAR_PX;
      const textHeight = lines.length * LINE_HEIGHT_PX;
      const diameter =
        Math.ceil(Math.sqrt(textWidth * textWidth + textHeight * textHeight)) +
        22;
      const fitted = Math.max(BASE_NODE_SIZE, Math.min(MAX_NODE_SIZE, diameter));
      return Math.max(MIN_NODE_SIZE, fitted);
    },
    containerIsVisible() {
      const el = this.$refs.graphContainer;
      if (!el) return false;
      return el.clientWidth > 0 && el.clientHeight > 0;
    },
    scheduleRender() {
      // 等容器有真实尺寸后再渲染，避免在隐藏 tab 中初始化导致 zoomToFit 失败
      this.$nextTick(() => {
        if (this.containerIsVisible()) {
          this.showSeeksGraph();
        }
        // 若此时还不可见，ResizeObserver 会在它变可见时再触发渲染
      });
    },
    onContainerResize() {
      if (!this.containerIsVisible()) return;
      if (!this.hasInjectedData) {
        this.showSeeksGraph();
      } else {
        this.fitView();
      }
    },
    fitView() {
      const graph = this.$refs.graphRef;
      if (!graph || typeof graph.getInstance !== "function") return;
      const instance = graph.getInstance();
      if (!instance) return;
      if (typeof instance.refresh === "function") instance.refresh();
      if (typeof instance.zoomToFit === "function") instance.zoomToFit();
    },
    showSeeksGraph() {
      const graph = this.$refs.graphRef;
      if (!graph || typeof graph.setJsonData !== "function") return;
      if (!this.relationList || this.relationList.length === 0) return;

      const data = { nodes: [], lines: [] };
      const limit = Math.min(this.relationList.length, 21);
      for (let i = 0; i < limit; i++) {
        const item = this.relationList[i];
        if (!item) continue;
        const fullName = item.display_name || "";
        const displayText = this.formatNodeText(fullName);
        const isRoot = i === 0;
        const size = isRoot
          ? Math.max(this.computeNodeSize(displayText), ROOT_NODE_SIZE)
          : this.computeNodeSize(displayText);

        if (isRoot) data.rootId = item.id;
        data.nodes.push({
          id: item.id,
          text: displayText,
          width: size,
          height: size,
          fontSize: isRoot ? 14 : 13,
          data: { fullName },
        });
        if (!isRoot) {
          data.lines.push({
            from: this.relationList[0].id,
            to: item.id,
          });
        }
      }

      this.hasInjectedData = true;
      graph.setJsonData(data, (graphInstance) => {
        const tryFit = () => {
          if (!graphInstance) return;
          if (!this.containerIsVisible()) return;
          if (typeof graphInstance.zoomToFit === "function") {
            graphInstance.zoomToFit();
          }
          if (typeof graphInstance.focusRootNode === "function") {
            graphInstance.focusRootNode();
          }
        };
        // center 布局是确定性的，但仍需等一帧让 DOM 应用 width/height
        requestAnimationFrame(() => requestAnimationFrame(tryFit));
        // 双保险：若上面 fit 时还未稳定，再延迟尝试一次
        if (this.fitTimer) clearTimeout(this.fitTimer);
        this.fitTimer = setTimeout(tryFit, 200);
      });
    },
    onNodeClick(nodeObject) {
      if (!nodeObject || !nodeObject.id) return;
      const path = scholarPortalPath({ id: nodeObject.id });
      if (path) this.$router.push({ path });
    },
    onLineClick(lineObject) {
      void lineObject;
    },
  },
};
</script>

<style scoped>
.my-graph {
  background: transparent !important;
  border: var(--theme-color) 5px solid;
  border-radius: 10px;
  margin: 3% auto;
  height: 70vh;
  min-height: 520px;
}

:deep(.relation-graph .rel-map) {
  cursor: grab !important;
}

:deep(.rel-node-shape-0.rel-node-type-node.rel-node) {
  cursor: pointer !important;
  overflow: hidden !important;
  transition: all ease-in-out 0.2s;
  display: flex !important;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
  padding: 6px;
  box-sizing: border-box;
}

:deep(.rel-node .c-node-text) {
  white-space: pre-line;
  word-break: break-word;
}

:deep(.rel-node:hover) {
  background: var(--theme-color) !important;
  box-shadow: 0 0 0 8px var(--theme-color-50) !important;
}

:deep(.rel-node .c-node-text span) {
  transition: all ease-in-out 0.2s;
}

:deep(.rel-node:hover .c-node-text span) {
  color: var(--theme-mode) !important;
}

:deep(.c-rg-line-checked-bg) {
  stroke: var(--theme-color-50) !important;
}

:deep(.relation-graph .rel-node-checked) {
  box-shadow: 0 0 0 8px var(--theme-color-50);
}
</style>
