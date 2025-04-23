<template>
  <div class="welcome">
    <header>

      <aside class="menu">
        <img src="../assets/favicon.svg" alt="Wormhole" width="100" id="logo" />
        <p class="menu-label">SERVER: {{ server.ip }} ({{server.name}} {{server.version}})<br>frida: {{ frida_version }}</p>

        <hr />

        <p class="menu-label">
          Devices
        </p>

        <ul class="menu-list device-list">
          <li v-for="dev in devices" :key="dev.id">
            <router-link :to="{ name: 'Apps', params: { device: dev.id } }">
              <b-icon icon="cellphone" size="is-small" />
              {{ dev.name }}
              <b-button
                size="is-small"
                class="remove"
                icon="delete"
                type="is-danger"
                @click.stop.prevent="remove(dev.id)"
              ><b-icon icon="delete" size="is-small" /></b-button>
            </router-link>
          </li>

          <li v-if="!loading && !devices.length">
            <b-icon icon="lan-disconnect" type="is-danger" />No device found
          </li>

          <li class="add-remote">
            <b-button expanded icon-left="plus-circle-outline" @click="connect">Connect Remote ...</b-button>
          </li>
        </ul>

        <hr />

        <p class="menu-label">Support</p>
        <ul class="menu-list">
          <li>
            <a target="_blank" href="https://github.com/p1tsi/wormhole">
              <b-icon type="is-small" icon="github" />&nbsp;GitHub
            </a>
          </li>
        </ul>
      </aside>
    </header>

    <router-view class="main"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Axios from 'axios'
import { io } from 'socket.io-client'

import Icon from '@/components/Icon.vue'
import Loading from '@/components/Loading.vue'

interface Device {
  name: string;
  removable: boolean;
  id: string;
}

interface Server {
  name: string;
  version: string;
  ip: string;
}

@Component({
  components: {
    Icon,
    Loading
  }
})
export default class Welcome extends Vue {
  frida_version = 'N/A'
  server: Server = {name: 'N/A', version: 'N/A', ip: 'N/A'}
  devices: Device[] = []
  loading = false

  mounted() {
    const socket = io('/devices', { transports: ['websocket'] })
    socket.on('deviceChanged', this.refresh)
    this.refresh()
  }

  remove(id: string) {
    const pattern = /^(tcp|socket)@/
    const matches = pattern.exec(id)
    if (matches) {
      const host = id.replace(pattern, '')
      Axios.delete(`/device/${host}`)
        .then(() => {
          this.$buefy.toast.open(`${host} is now disconnected`)
        })
        .finally(this.refresh)
    }
  }

  connect() {
    this.$buefy.dialog.prompt({
      message: 'Connect Remote Device via TCP',
      inputAttrs: { placeholder: 'IP address or hostname' },
      trapFocus: true,
      onConfirm: host => {
        Axios.put('/remote/add', { host })
          .then(() => {
            this.refresh()
            this.$buefy.toast.open(`Successfully added ${host}`)
          })
          .catch(e => {
            this.$buefy.toast.open({
              type: 'is-error',
              message: `Failed to connect remote device, reason: ${e}`
            })
          })
      }
    })
  }

  refresh() {
    this.loading = true
    Axios.get('/devices')
      .then(({ data }) => {
        this.frida_version = data.version
        this.server = data.server
        this.devices = data.list

        const { device } = this.$route.params
        if (device && !data.list.find((e: { id: string }) => e.id === device)) {
          this.$router.push('/') // current device has been removed
        }
      })
      .catch(e => {
        this.$buefy.dialog.alert({
          title: 'Failed to load devices',
          message: e.response.data,
          type: 'is-danger',
          hasIcon: true,
          icon: 'close-circle',
          ariaRole: 'alertdialog',
          ariaModal: true
        })
      })
      .finally(() => {
        this.loading = false
      })
  }
}
</script>

<style lang="scss" scoped>
.welcome {
  display: flex;
  flex-direction: row;

  header {
    width: 320px;
    padding: 40px;
    min-height: 100vh;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    position: sticky;
    top: 0;
  }

  .main {
    flex: 1;
  }
}

h1 {
  margin: 0;
  font-weight: 100;
}

.device-list {
  canvas {
    margin-right: 4px;
  }

  .add-remote {
    margin-top: 10px;
  }

  .remove {
    height: 1.5em;
    width: 1.5em;
  }

  a {
    display: flex;
    align-items: center;
  }

  .icon {
    margin-right: 4px;
  }

  button {
    margin-left: auto;
  }
}
</style>
