<template>
  <div class="pad">
    <!--<header>
      <b-field>
        <p class="control"><b-button icon-left="delete-forever" type="is-danger" @click="clearLogs">Clear</b-button></p>
      </b-field>
    </header>-->
    <b-tabs>
      <!--<b-tab-item :label="'All (' + logs.length + ')'" class="content">
      </b-tab-item>
      <b-tab-item v-for="plugin in plugins" class="content" :label="plugin+ '(' + countByPlugin(plugin) + ')'">
      </b-tab-item>-->
      <b-input
        placeholder="Search..."
        v-model="msgFilter"
        type="search"
        icon="magnify">
      </b-input>
    </b-tabs>

    <div>
      <b-table :data="logsToView" default-sort="base" focusable>  <!--sticky-header-->
        <template slot-scope="props">
          <b-table-column field="no" label="No." sortable numeric>
            <p>{{ props.row.no }} </p>  
          </b-table-column>
          <!--<b-table-column field="timestamp" label="Timestamp" sortable numeric>
            <p>{{ props.row.timestamp }} </p>
          </b-table-column>
          <b-table-column field="thread" label="Thread">
            <p> {{ props.row.thread}} </p>
          </b-table-column>-->
          <b-table-column field="plugin" label="Plugin">
            <p> {{ props.row.plugin}} </p>
          </b-table-column>
          <!--<b-table-column field="function" label="Function">
            <p> {{ props.row.function}} </p>
          </b-table-column>-->
          <b-table-column field="message" label="Message">
            <p> {{ props.row.message}} </p>
          </b-table-column>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">

import { Prop, Component, Watch } from 'vue-property-decorator'
import Base from './Base.vue'


interface Log {
  no: number,
  //timestamp: string,
  plugin: string,
  //thread: string,
  //function: string,
  message: string,
}


@Component
export default class RuntimeOps extends Base {

  @Prop({ required: false })
  plugins!: string[]

  @Prop({ required: false })
  customPlugins!: string[]
  
  logs: Log[] = []
  logsToView: Log[] = []

  msgFilter: string = ''

  @Watch('msgFilter')
  input(keyword: string) {
    this.filterLogs(keyword)
  }

  containsString(log: Log, str: string){
    return log.message.includes(str)
  }

  loadMessages(fil: string){
    this.logs = this.logs.filter((item) => {return this.containsString(item, fil)})
  }

  mounted() {
    let i = 0;
    this.$ws.on('message', (message) => {
      message['data']['no'] = ++i;
      this.logs.push(message['data']);
      this.title = 'RuntimeOps (' + this.logs.length + ')';
      this.filterLogs(this.msgFilter);
    })
    if (this.plugins.length > 0 || this.customPlugins.length > 0){
      this.$rpc.operations(this.plugins, this.customPlugins).then(
        (response: boolean) => {
          console.log(response);
        }
      );
    }
  }

  clearLogs(){
    this.logs = [];
  }

  countByPlugin(plugin: string) {
    return this.logs.filter((log) => {return log.plugin == plugin}).length
  }

  filterLogs(keyword: string){
    if (keyword !== ''){
      this.logsToView = this.logs.filter(log => {return log.message.includes(keyword)})
    }
    else{
      this.logsToView = this.logs
    } 
  }
}

</script>

<style lang="scss" scoped>
h1, h2 {
  font-weight: 100;
}

p, code {
  font-size: 13px;
}

.greentextclass {
  color: green;
}


</style>
