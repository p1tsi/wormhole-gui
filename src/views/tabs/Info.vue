<template>
  <div class="pad content">
    <div class="card">
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <figure class="image is-64x64">
              <img v-if="icon" :src="icon" alt="AppIcon" />
            </figure>
          </div>
          <div class="media-content">
            <p class="title is-4">{{ info.name }}</p>
            <p class="subtitle is-6">
              {{ info.id }}
              <span class="has-text-darker">{{ info.semVer }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <dl @click.capture="onSelectText">
      <dt>
        Container
        <a @click="open('home')"><b-icon icon="open-in-new" /></a>
      </dt>
      <dd>{{ info.home }}</dd>
      <dt>Temporary Directory</dt>
      <dd>{{ info.tmp }}</dd>
      <dt>Installation
        <a @click="open('bundle')"><b-icon icon="open-in-new" /></a>
      </dt>
      <dd>{{ info.bundle }}</dd>
      <dt>Executable</dt>
      <dd>{{ info.binary }}</dd>
      <dt>Minimum OS Requirement</dt>
      <dd>{{ info.minOS }}</dd>
      <dt>Info.plist</dt>
      <dd>
        <data-field
          class="plist dark"
          :depth="0"
          :field="{ value: info.json }"
        />
      </dd>
    </dl>
  </div>
</template>

<script lang="ts">
import router from '@/router'
import { FinderModule } from '@/store/modules/finder'
import { Component } from 'vue-property-decorator'
import DataField from '@/components/DataField.vue'
import Base from './Base.vue'

@Component({
  components: {
    DataField,
  },
})
export default class Info extends Base {
  info: object = {}
  icon?: string = ''

  mounted() {
    this.title = 'Basic Information'
    this.loading = true
    this.load().finally(() => {
      this.loading = false
    })
  }

  open(dest: string) {
    router.push({ name: 'Files' }).catch((_) => {})

    if (dest === 'home') {
      FinderModule.goHome()
    } else if (dest === 'bundle') {
      FinderModule.goApp()
    } else {
      throw new Error('invalid destination: ' + dest)
    }
    this.$bus.$emit('switchTab', 'Finder', 'Finder')
  }

  async load() {
    const data = (await this.$rpc.info.icon()) as ArrayBuffer
    this.info = await this.$rpc.info.info()    
    if (!data.byteLength) return // todo: placeholder
    const blob = new Blob([data], { type: 'image/png' })
    this.icon = URL.createObjectURL(blob)
  }

  onSelectText(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName.toLowerCase() !== 'dd') return
    const selection = getSelection()
    if (!selection) return
    const range = document.createRange()
    range.selectNodeContents(target)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
}

h1 {
  font-weight: 100;
}

.plist {
  width: 100%;
  word-break: break-all;
}

dt {
  font-weight: bold;
  color: #888;
  margin-top: 10px;
}

dd {
  color: #efefef;
  margin-left: 0;
  margin-bottom: 10px;
}

dl {
  margin: 10px 0;
}
</style>
