<template>
  <div id="terminal" class="terminal">
  </div>
</template>

<script lang="ts">

import { Terminal } from 'xterm'
import Base from './Base.vue'
import DataField from '@/components/DataField.vue'
import { Component } from 'vue-property-decorator'
import { FitAddon } from 'xterm-addon-fit';


@Component({
  components: {
    DataField
  }
})
export default class Radare2 extends Base {

  term = new Terminal();
  cmd : string = '';

  mounted() {
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer != null){ 
      const fitAddon = new FitAddon();
      this.term.loadAddon(fitAddon);
      this.term.open(terminalContainer);
      this.term.setOption('cursorBlink', true);
      this.term.focus();
      this.term.write("r2> ");
      console.log(this.term);

      this.term.attachCustomKeyEventHandler((event) => {
        // process chars
        return true;
      })


      this.term.onData((data) => {
        this.cmd += data;
        this.term.write(data)
        if (this.cmd === '\n'){
          this.$rpc.radare2(this.cmd);
          this.cmd = '';
          this.term.clear();
        } 
      });

    }
  }
}

</script>

<style>
#terminal {
    display: block;
    width: calc(100% - 1px);
    margin: 0 auto;
    padding: 2px;
    height: calc(100% - 19px);
}
.terminal {
    background-color: #000000;
    color: #fafafa;
    padding: 2px;
    height: calc(100% - 19px);
}
.terminal:focus .terminal-cursor {
    background-color: #fafafa;
}
</style>
