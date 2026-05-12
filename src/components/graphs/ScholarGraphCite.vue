<template>
  <div>
    <slot></slot>
    <div ref="chartEl" id="scholar-graph" style="width: 80%; height: 40vh; margin:0 auto;"></div>
  </div>
</template>
  
<script>
import * as echarts from "echarts/core";
import { TooltipComponent, GridComponent } from "echarts/components";
import { BarChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

export default {
  props: ["info"],
  mounted() {
    this.initChart();
    if (Array.isArray(this.info) && this.info.length > 0) {
      this.applyInfo(this.info)
    }
  },
  data() {
    return {
      option: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            min: 0,
            max: 40000, // 引用数量的Y轴上限
            // 可以为此轴添加额外的样式和配置
            position: "right",
          },
          {
            type: "value",
            min: 0,
            max: 2000, // 成果数量的Y轴上限
            // 可以为此轴添加额外的样式和配置
            // 设置为右侧的 Y 轴
            position: "left",
          },
        ],
        series: [
          {
            name: this.$t("institution_achievement_number"),
            type: "bar",
            barWidth: "35%",
            data: [],
            yAxisIndex: 1, // 使用第二个Y轴（右侧）
          },
          {
            name: this.$t("institution_cite_number"),
            type: "bar",
            barWidth: "35%",
            data: [],
            yAxisIndex: 0, // 使用第一个Y轴（左侧）
          },
        ],
      },
    };
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.manualResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.destroyChart();
  },
  methods: {
    containerIsVisible() {
      const dom = this.$refs.chartEl;
      return !!dom && dom.clientWidth > 0 && dom.clientHeight > 0;
    },
    initChart() {
      // 引入需要使用的组件和渲染器
      echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

      // 获取图表容器
      const chartDom = this.$refs.chartEl;
      if (!chartDom) return;

      // 若组件挂载时其所在 tab 仍处于 display:none 状态，DOM 尺寸为 0，
      // 直接 init 会触发 ECharts 的 "Can't get DOM width or height" 警告。
      // 用 ResizeObserver 等待容器获得真实尺寸后再初始化。
      if (!this.containerIsVisible()) {
        if (typeof ResizeObserver !== "undefined") {
          this.resizeObserver = new ResizeObserver(() => {
            if (this.containerIsVisible() && !this.chart) {
              this.resizeObserver.disconnect();
              this.resizeObserver = null;
              this.initChart();
              // 初始化时所在 tab 还隐藏，info watcher 的 immediate 调用
              // 已经因 chart 为空而 no-op；这里在真正初始化后再应用一次数据
              if (Array.isArray(this.info) && this.info.length > 0) {
                this.applyInfo(this.info);
              }
            } else if (this.chart) {
              this.manualResize();
            }
          });
          this.resizeObserver.observe(chartDom);
        }
        return;
      }

      // 初始化图表
      this.chart = echarts.init(chartDom);

      // 设置图表配置项

      // 设置图表配置项并渲染图表
      // this.chart.setOption(this.option);

      // var len = this.info.length;
      // console.log(this.info, "!!!!!!!");
      // // const reversedInfo = this.info.reverse();
      // const sortedInfo = this.info.sort((a, b) => b.year - a.year);

      // sortedInfo.reverse().forEach((element) => {
      //   this.option.xAxis[0].data.push(element.year);
      //   this.option.series[0].data.push(element.works_count);
      //   this.option.series[1].data.push(element.cited_by_count);
      // });
      if (this.chart)
        this.chart.setOption(this.option);

      window.addEventListener("resize", this.manualResize);

    },

    destroyChart() {
      if (this.chart) {
        this.chart.dispose();
        this.chart = null;
      }
    },
    manualResize() {
      if (this.chart) this.chart.resize();
    },
    applyInfo(newVal) {
      if (!this.chart) return
      this.option.xAxis[0].data = []
      this.option.series[0].data = []
      this.option.series[1].data = []

      const sorted = [...newVal].sort((a, b) => (a.year || 0) - (b.year || 0))
      const tail = sorted.slice(-6)

      let maxWorksCount = 0
      let maxCitedByCount = 0
      tail.forEach((item) => {
        if (!item) return
        this.option.xAxis[0].data.push(item.year)
        this.option.series[0].data.push(item.works_count || 0)
        this.option.series[1].data.push(item.cited_by_count || 0)
        if ((item.works_count || 0) > maxWorksCount) maxWorksCount = item.works_count
        if ((item.cited_by_count || 0) > maxCitedByCount) maxCitedByCount = item.cited_by_count
      })

      this.option.yAxis[0].max = Math.max(1, Math.ceil(maxCitedByCount * 1.1))
      this.option.yAxis[1].max = Math.max(1, Math.ceil(maxWorksCount * 1.1))

      this.chart.setOption(this.option)
    }
  },

  watch: {
    info: {
      immediate: true,
      handler(newVal) {
        if (!Array.isArray(newVal)) return
        this.$nextTick(() => this.applyInfo(newVal))
      }
    }
  },
};
</script>