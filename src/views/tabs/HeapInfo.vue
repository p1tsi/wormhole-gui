<template>
    <div class="pad">
      <section class="content">
        <h1>Heap</h1>
      </section>
      
      <div v-for="obj in objects">
        <h2 style="color: red" >{{ obj.isa }} ({{obj.ptr}})</h2>
        <ul >
          <li v-for="ivar in obj.ivars"> {{ ivar.name }}: <code @click="getObject(ivar.ptr)"> {{ivar.value}} </code></li>
        </ul>
      </div>
      
    </div>
  </template>
  
  <script lang="ts">

  import { Prop, Component } from 'vue-property-decorator'
  import Base from './Base.vue'

  interface Ivar{
    name: string,
    value: string,
    ptr: string 
  }

  interface Object{
    isa: string;
    description: string;
    ptr: string;
    ivars: Ivar[],
  }

  
  @Component
  export default class HeapInfo extends Base {
    updateFilter?: Function

    objects: Object[] = []
  
    includeSuper = false
    keyword = ''
  
  
    @Prop({ required: true })
    name!: string
  
    mounted() {
      console.log(this.name);
      this.loading = true
      this.$rpc.heap.inspect(this.name)
        .then((response: Object[]) => {
          this.objects = this.objects.concat(response)
          this.objects.map(obj =>{
            return {
              isa: obj.isa,
              description: obj.description,
              ivars: obj.ivars,
              ptr: obj.ptr,
              expanded: false,
            }
          })
        })
        .finally(() => {
          this.loading = false
          this.title = 'Heap (' + this.objects.length + ')'
        })
    }

    getObject(obj_ptr: string){
      if (obj_ptr == '0x0'){
        return;
      }
      this.loading = true
      this.$rpc.heap.getivarsbyobject(obj_ptr)
        .then((response: Object) => {
          this.objects = this.objects.concat(response)
          this.objects.map(obj =>{
            return {
              isa: obj.isa,
              description: obj.description,
              ivars: obj.ivars,
              ptr: obj.ptr,
              expanded: false,
            }
          })
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
  
  </script>
  
  <style lang="scss" scoped>
  h1, h2 {
    font-weight: 100;
  }

  </style>
  