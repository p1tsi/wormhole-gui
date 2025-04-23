<template>
  <div class="device-info">
    <header class="content">
      <h1 v-if="info">{{ info.name }} {{ info.os.version }} 
        <b-icon v-if="info.access == 'jailed'" icon="lock" size="is-medium" style="color: red;"/>
        <b-icon v-else icon="lock-open" size="is-medium" style="color: green" />
      </h1>
      <h1 v-else>{{ shortened }}</h1> 
      <h5 v-if="info">
        Arch: {{ info.arch }}
        Version: {{ info.os.version }}
        Platform: {{ info.platform }}
        Access: {{ info.access }}
      </h5>
    </header>
    
    <!-- APPS -->
    <b-tabs expanded>
    <b-tab-item :label="'Applications (' + filteredApps.length + ')'" class="content">
      <b-input
        placeholder="Search application..."
        v-model="appFilter"
        type="search"
        icon="magnify">
      </b-input>
      <div class="apps" v-if="filteredApps.length">
        <ul>
          <li :key="app.identifier" v-for="app in filteredApps">
            <router-link :to="{ name: 'General', params: { device, bundle: app.identifier }}">
              <img
                v-bind:src=app.icon width="80" height="80">
              <h2>{{ app.name }}</h2>
              <p>{{ app.identifier }}</p>
            </router-link>
          </li>
        </ul>
      </div>

      <div v-else class="center has-text-centered">
        <Loading v-if="loading" class="animation" />
        <h1 v-else-if="error.title" class="error">
          <b-icon icon="message-alert" size="is-medium" />
          <br />
          {{ error.title }}
        </h1>
        <pre v-if="error.stack">{{ error.stack }}</pre>
      </div>
    </b-tab-item>

    <!-- PROCESSES -->
    <b-tab-item class="content" :label="'Processes (' + filteredProcesses.length + ')'">
      <b-input
        placeholder="Search process..."
        v-model="procFilter"
        type="search"
        icon="magnify">
      </b-input>
      <div class="apps" v-if="filteredProcesses.length">
        <ul>
          <li :key="process.pid" v-for="process in filteredProcesses">
            <router-link :to="{ name: 'General', params: { device, bundle: process.pid }}">
              <img
                v-bind:src=process.icon width="32" height="32">
              <h2>{{ process.name }}</h2>
              <p>{{ process.pid }}</p>
            </router-link>
          </li>
        </ul>
      </div>

      <div v-else class="center has-text-centered">
        <Loading v-if="loading" class="animation" />
        <h1 v-else-if="error.title" class="error">
          <b-icon icon="message-alert" size="is-medium" />
          <br />
          {{ error.title }}
        </h1>
        <pre v-if="error.stack">{{ error.stack }}</pre>
      </div>
    </b-tab-item>
  </b-tabs>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import { Component, Vue, Watch } from 'vue-property-decorator'
import Axios from 'axios'
import debounce from 'lodash.debounce'

import Loading from '../components/Loading.vue'

interface Failure {
  title?: string;
  stack?: string;
}

interface App {
  identifier: string;
  name: string;
  icon: string;
}

interface Process {
  name: string;
  parameters: string;
  pid: number;
  icon: string;
}

interface Info {
  name?: string;
  arch?: string;
  os: {
    version?: string;
  };
  platform?: string;
  access?: string;
}

@Component({
  components: {
    Loading
  }
})
export default class Device extends Vue {
  info: Info | null = null
  device = ''
  loading = false
  screen = true
  error: Failure = {}

  apps: App[] = []
  filteredApps: App[] = []
  appFilter: string = ''

  processes: Process[] = []
  filteredProcesses: Process[] = []
  procFilter: string = ''

  observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      const img = entry.target as HTMLImageElement
      img.setAttribute('src', img.dataset.src!)
      img.classList.remove('lazy')
      observer.unobserve(img)
    })
  })

  get shortened() {
    if (this.device.length > 6)
      return this.device.substring(0, 8) + '...'
    else
      return this.device
  }

  @Watch('appFilter')
  onAppFilterChanged(keyword: string) {
    this.filterApps(keyword)
  }

  filterApps(keyword: string) {
    if (keyword !== '') {
      const lowerKeyword = keyword.toLowerCase()
      this.filteredApps = this.apps.filter(proc =>
        proc.name.toLowerCase().includes(lowerKeyword)
      )
    } else {
      this.filteredApps = this.apps
    }
  }

  @Watch('procFilter')
  onProcFilterChanged(keyword: string) {
    this.filterProcesses(keyword)
  }

  filterProcesses(keyword: string) {
    if (keyword !== '') {
      const lowerKeyword = keyword.toLowerCase()
      this.filteredProcesses = this.processes.filter(proc =>
        proc.name.toLowerCase().includes(lowerKeyword)
      )
    } else {
      this.filteredProcesses = this.processes
    }
  }

  @Watch('$route', { immediate: true })
  private navigate(route: Route) {
    const { device } = route.params

    this.device = device
    this.info = null
    this.apps = []
    this.loading = true
    this.error = {}

    Axios.get(`/device/${device}/info`)
      .then(({ data }) => this.info = data)
      .catch(() => this.info = null)
      .then(() => Axios.get(`/device/${device}/apps`))
      .then(({ data }) => {
        //document.querySelectorAll('img.lazy').forEach(e => this.observer.unobserve(e))
        this.apps = data['apps']
        this.filteredApps = data['apps']
        this.processes = data['processes']
        this.filteredProcesses = data['processes']
        this.$nextTick(() =>
          document.querySelectorAll('img.lazy').forEach(e => this.observer.observe(e)))
        
        if (!data.length) {
          this.error.title = 'Unable to retrieve apps&processes from this device'
        }
        if (!this.apps.length) {
          this.error.title = 'Unable to retrieve apps from this device'
        }
        if (!this.processes.length) {
          this.error.title = 'Unable to retrieve processes from this device'
        }        
      })
      .catch(e => {
        [this.error.title, this.error.stack] = e.response.data.split('\n', 1)
        this.filteredApps = []
        this.filteredProcesses = []
      })  
      .finally(() => (this.loading = false))
  }

}
</script>

<style lang="scss" scoped>
.center {
  margin: auto;
  min-width: 360px;
  .animation {
    margin: auto;
    width: 144px;
  }

  h1.error {
    font-weight: 100;
    color: #ffffff73;

    .icon {
      margin-right: 4px;
    }
  }
}

.info p {
  font-size: 0.75rem;
  opacity: 0.75;
  margin-left: 20px;
}

header {
  padding: 40px;

  h1 {
    padding-left: 10px;
    padding-right: 10px;
    font-size: 2rem;
    font-weight: 100;
    top: 0;
  }
}

footer {
  padding: 40px 40px 20px 40px;
  color: rgb(124, 124, 124);
}

@media (max-width: 1800px) {
  header {
    display: block;
    h1 {
      margin-bottom: 20px;
    }
  }
}

.main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.apps {
  padding: 0 20px;

  ul {
    display: grid;
    grid-row-gap: 10px;
    grid-column-gap: 10px;
    justify-content: space-around;
    grid-template-columns: repeat(auto-fill, 15rem);
  }

  ul > li {
    text-align: center;

    a {
      display: block;
      padding: 10px;
      overflow-x: hidden;
      border-radius: 4px;

      &:hover {
        background: #111;
      }
    }

    h2 {
      font-size: 1rem;
      color: #efefef;
    }

    p {
      color: #888;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    img {
      width: 90px;
      height: 90px;
      display: block;
      margin: 1rem auto;
    }
  }
}
</style>
