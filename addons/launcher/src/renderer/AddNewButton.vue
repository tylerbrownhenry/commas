<script lang="ts">
export default {
  // Empty options object
}
</script>

<template>
    <div class="tab-item">
      <div class="tab-item-card">
        <div class="tab-overview">
          <div class="tab-title">
            <span class="tab-icon ph-normal ph ph-terminal"></span>
            <span class="tab-icon ph-normal ph ph-plus"></span>
            <span class="tab-name">New Tab</span>
          </div>
          <div class="right-side">
            <div class="operations">
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  



<style lang="scss" scoped>

.ph-terminal{
    font-family: "Phosphor" !important;
    font-size: 20px;
}
.ph-plus {
position: absolute;
    font-size: 20px;
    top: 3px;
    left: 410x;
}

.tab-item {
  padding: 25px; // 8px
  padding-top: 10px;
  cursor: pointer;
  .tab-list.vertical & {
    padding-bottom: 0;
  }
  .tab-list.horizontal & {
    padding-right: 0;
  }
}
.tab-title {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  opacity: 0.75;
  transition: opacity 0.2s;
  color: #afff00;
  .tab-item.virtual & {
    opacity: 0.5;
  }
  .tab-item.focused &,
  .sortable-item.dragging & {
    opacity: 1;
  }
  .sortable-item.dragging & {
    color: rgb(var(--system-yellow));
  }
}
.tab-icon {
  display: inline-block;
  flex: none;
  margin-right: 15px; // 6px
  color: #afff00;
  border-radius: 5px;
  padding: 5px;
  font-size: 11px;
  font-weight: 800;
  margin-left: 0px;
}
.tab-name {
  flex: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: color 0.2s;
}
.tab-item-card {
  padding: 0 8px;
  border-radius: 8px;
  .tab-item.active & {
    background: linear-gradient(to right, transparent, var(--design-card-background));
  }
  .tab-item.focused & {
    background: var(--design-card-background);
  }
  .tab-item:hover & {
    background: var(--design-card-background);
  }
}
.tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--min-tab-height);
}
.right-side {
  flex: none;
}
.idle-light {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 6px;
  vertical-align: 1px;
  background: currentColor;
  border-radius: 50%;
  transition: color 0.2s;

  position: absolute;
  top: -5px;
  width: 10px;
  height: 10px;
  left: -10px;
  &.busy {
    color: rgb(var(--system-green));
  }
  &.alerting {
    color: rgb(var(--system-yellow));
  }
  .tab-item:hover & {
    display: none;
  }
}
.operations {
  display: none;
  font-size: 14px;
  text-align: center;
  .tab-item:hover & {
    display: flex;
  }
}
.button {
  width: 18px;
  transition: color 0.2s;
  cursor: pointer;
}
.close:hover {
  color: rgb(var(--system-red));
}
.tab-thumbnail {
  padding-bottom: calc((var(--min-tab-height) - 16px) / 2);
  color: rgb(var(--theme-foreground) / 0.5);
  font-style: italic;
  font-size: 12px;
  line-height: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
