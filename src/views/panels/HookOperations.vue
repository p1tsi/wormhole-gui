<template>
  <aside class="menu">
    <b-button variant="outline-primary" @click="go('RuntimeOps')">HOOK</b-button>
    <b-button variant="outline-primary" @click="stopHooking()">STOP</b-button>
    <h3>PLUGINS</h3>
    <ul class="menu-list">
      <li v-for="(item) in pluginList">
          <input type="checkbox" v-model="item.checked"/>{{ item.name }}
      </li>
    </ul>
    <h3>CUSTOM PLUGINS</h3>
    <ul class="menu-list">
      <li v-for="(item) in customPluginList">
          <input type="checkbox" v-model="item.checked"/>{{ item.name }}
      </li>
    </ul>

  </aside>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'

type Plugin = {
  name: string;
  checked: boolean;
}

@Component
export default class HookOperations extends Vue {

  pluginList: Plugin[] = [
    {name: "encryption", checked: false},
    {name: "gestalt", checked: false},
    {name: "icloud", checked: false},
    {name: "io", checked: false},
    {name: "keychain", checked: false},
    {name: "network", checked: false},
    {name: "notifications", checked: false},
    {name:"sqlite", checked: false},
    {name: "xpc", checked: false},    
    //{name: "mach", checked: false},
    {name: "IOKit", checked: false},
    {name: "dyld", checked: false},
    {name: "call", checked: false},
    {name: "syscall", checked: false}
  ];

  customPluginList: Plugin[] = [];

  mounted(){
    this.$rpc.customplugins().then(
      (response: string[]) =>{
        response.forEach(customplugin =>{
          this.customPluginList.push({name: customplugin, checked: false})
        })
      }
    )
  }

  isChecked(item: Plugin){
    return item.checked
  }

  getName(item: Plugin){
    return item.name
  }

  go(component: string, title?: string, props?: object) {
    const pl = this.pluginList.filter(this.isChecked).map(this.getName);
    const cpl = this.customPluginList.filter(this.isChecked).map(this.getName);
    if (pl.length > 0 || cpl.length > 0) {
      this.$bus.$emit('switchTab', component, title || component, {plugins: pl, customPlugins: cpl});
    }
  }

  stopHooking() {
    this.$rpc.unhook();
    this.pluginList.forEach(plugin => {
      plugin.checked = false;
    });
  }
}
</script>

<style lang="scss" scoped>
.menu {
  padding: 20px;
}

.menu-list li {
  padding: 6px 12px;
  cursor: pointer;
  background: transparent;
  color: #aaa;
  transition: ease-in 0.2s background-color, color;
  text-shadow: 1px 1px 2px #00000030;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  .icon {
    margin-right: 8px;
  }

  &:hover {
    background: #00000030;
    color: #fff;
  }
}
</style>