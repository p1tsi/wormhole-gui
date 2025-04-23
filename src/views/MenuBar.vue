<template>
  <menu>
    <h1 @dblclick="external('https://www.youtube.com/watch?v=dQw4w9WgXcQ')">
      <img src="../assets/favicon.svg" width="20">
    </h1>
    <themed-menu class="menu">
      <hsc-menu-bar>
        <!--<hsc-menu-bar-item label="General">
          <hsc-menu-item label="Basic" @click="go('Info')"/>
          <hsc-menu-item label="CheckSec" @click="go('CheckSec')"/>
          <hsc-menu-item label="URL Schemes" @click="go('Url', 'URL Schemes')"/>
          <hsc-menu-separator />
          <hsc-menu-item label="Cookies" @click="go('Cookies')"/>
          <hsc-menu-item label="KeyChain" @click="go('KeyChain')"/>
          <hsc-menu-item label="NSUserDefaults" @click="go('UserDefaults')"/>
          <hsc-menu-separator />
          <hsc-menu-item label="UIDump" @click="open('UIDump')"/>
          <hsc-menu-item label="Privacy" @click="go('Privacy')"/>
          <hsc-menu-separator />
          <hsc-menu-item label="GPS Simulator" @click="go('GeoLocation')"/>
        </hsc-menu-bar-item>
        <hsc-menu-bar-item label="Finder">
          <hsc-menu-item label="Home" @click="finder('home')"/>
          <hsc-menu-item label="Bundle" @click="finder('bundle')"/>
        </hsc-menu-bar-item>
        <hsc-menu-bar-item label="View">
          <hsc-menu-item label="Process Modules" @click="redirect({ name: 'Modules' })"/>
          <hsc-menu-item label="Runtime Classes" @click="redirect({ name: 'Classes' })"/>
          <hsc-menu-separator />
          <hsc-menu-item label="Search API" @click="redirect({ name: 'Api Resolver' })"/>
          <hsc-menu-separator />
          <hsc-menu-item label="REPL" @click="redirect({ name: 'REPL' })"/>
          <hsc-menu-separator />
          <hsc-menu-item label="WebViews and JavascriptCore Instances" @click="redirect({ name: 'WebViews' })"/>
        </hsc-menu-bar-item>-->
        <hsc-menu-bar-item label="Session">
          <hsc-menu-item label="Reload" @click="reload" />
          <hsc-menu-item label="Detach" @click="detach" />
          <hsc-menu-separator />
          <hsc-menu-item label="Kill" @click="kill" />
        </hsc-menu-bar-item>
        <!--<hsc-menu-bar-item label="Layout">
          <hsc-menu-item label="Reset" @click="reset"/>
        </hsc-menu-bar-item>-->
        <!-- <hsc-menu-bar-item label="Snippet">
          <hsc-menu-item label="New REPL" />
          <hsc-menu-separator />
          <hsc-menu-item label="Open Snippet" />
          <hsc-menu-item label="Import Snippet" />
          <hsc-menu-separator />
          <hsc-menu-item label="Save Snippet" keybind="meta+s" />
          <hsc-menu-item label="Export Snippet" />
        </hsc-menu-bar-item>
        <hsc-menu-bar-item label="Log">
          <hsc-menu-item label="Export" />
          <hsc-menu-item label="Search" />
        </hsc-menu-bar-item> -->
        <!--<hsc-menu-item label="Check NPM Updates" @click="update()" /> 
        </hsc-menu-bar-item>-->
        
        <!--<hsc-menu-bar-item label="Actions">
          <b-icon icon="alert" size="is-small" v-if="!targetResumed" />
          <b-icon icon="check" size="is-small" v-else />
          <hsc-menu-item label="Resume Target" @click="resumeTarget()" />
          <hsc-menu-separator />
          <b-icon icon="alert" size="is-small" v-if="!unpinned" />
          <b-icon icon="check" size="is-small" v-else />
          <hsc-menu-item label="Bypass Cert Pinning" @click="certPinning()" />
          <hsc-menu-separator />
          <b-icon icon="alert" size="is-small" v-if="!rootBypass" />
          <b-icon icon="check" size="is-small" v-else />
          <hsc-menu-item label="Bypass Anti-Root Checks" @click="certPinning()" />
        </hsc-menu-bar-item>-->
        <hsc-menu-bar-item label="Actions">
          <hsc-menu-item label="Resume Target" type="radio" v-model="targetResumed" @click="resumeTarget" />
          <hsc-menu-separator />
          <hsc-menu-item label="Bypass Cert Pinning" type="radio" v-model="unpinned" @click="certPinning" />
          <hsc-menu-separator />
          <hsc-menu-item label="Bypass Anti-JB Checks" type="radio" v-model="jbCheckBypass" @click="jailbreakChecksBypass" />
          <hsc-menu-separator />
          <hsc-menu-item label="Dump IPA" type="radio" v-model="dumpedIPA" @click="dumpIPA" />
          <!--<hsc-menu-separator />
          <hsc-menu-item label="Dump Decrypted Executables" type="radio" v-model="dumpedEXE" @click="dumpEXE" />-->
        </hsc-menu-bar-item>

      </hsc-menu-bar>
    </themed-menu>
  

    <b-modal :active.sync="isAboutDialogActive" :width="480" scroll="keep">
      <div class="card has-text-centered">
        <div class="card-image">
          <img src="../assets/favicon.svg" alt="Wormhole" class="image" width="300" style="margin: 40px auto" />
        </div>
        <div class="card-content">
          <h2>Wormhole @{{ version }}</h2>
          <p>Runtime Application Instruments for iOS</p>
          <hr>
          <p>Brought to you by <a href="https://twitter.com/codecolorist" target="_blank">@CodeColorist</a></p>
          <p>Built on <a href="https://vuejs.org/" target="_blank">Vue.js</a>,
            <a href="https://frida.re/" target="_blank">frida</a>
            and <a href="https://buefy.org/" target="_blanl">Buefy</a></p>
        </div>
      </div>
    </b-modal>
  </menu>
</template>

<script lang="ts">
import pkg from '../../package.json'

import Axios from 'axios'
import { StyleFactory } from '@hscmap/vue-menu'
import { Component, Vue } from 'vue-property-decorator'
import router from '@/router'
import { FinderModule } from '@/store/modules/finder'
import { RawLocation } from 'vue-router'

import { io } from 'socket.io-client'



@Component({
  components: {
    'themed-menu': StyleFactory({
      menu: {
        borderRadius: '2px',
        fontWeight: '100',
        background: '#1e1e1e',
        boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.3)'
      },
      menubar: {
        background: '#222',
        color: '#c1c1c1'
      },
      active: {
        backgroundColor: '#505050',
        zIndex: '99999'
      },
      disabled: {
        opacity: '0.5'
      },
      separator: {
        backgroundColor: '#333'
      },
      animation: false
    })
  }
})
export default class MenuBar extends Vue {
  isAboutDialogActive = false
  version = pkg.version

  started: boolean = false
  targetResumed: boolean = false
  unpinned: boolean = false
  jbCheckBypass: boolean = false
  dumpedIPA: boolean = false
  dumpedEXE: boolean = false

  /*redirect(url: RawLocation) {
    router.push(url).catch((_) => {})
  }*/

  /*finder(dest: string) {
    this.redirect({ name: 'Files' })

    if (dest === 'home') {
      FinderModule.goHome()
    } else if (dest === 'bundle') {
      FinderModule.goApp()
    } else {
      throw new Error('invalid destination: ' + dest)
    }
    this.$bus.$emit('switchTab', 'Finder', 'Finder')
  }

  open(component: string, title?: string, props?: object) {
    this.$bus.$emit('openTab', component, title || component, props)
  }

  go(component: string, title?: string, props?: object) {
    this.$bus.$emit('switchTab', component, title || component, props)
  }*/

  external(url: string) {
    window.open(url, '_blank')
  }

  reload() {
    location.reload()
  }

  kill() {
    this.$ws.send('kill')
    this.detach()
  }

  reset() {
    localStorage.removeItem('layout-state')
    location.reload()
  }

  detach() {
    this.$router.push({
      name: 'Apps',
      params: { device: this.$route.params.device }
    })
  }

  update() {
    Axios.get('/update').then(({ data }) => {
      const { current, latest } = data
      if (current !== latest) {
        this.$buefy.dialog.alert({
          hasIcon: true,
          icon: 'update',
          type: 'is-success',
          title: 'New version found',
          message: `Newer version ${latest} found. You are on ${current}.
For the limitation of web app, we don't provide automate update.<br>
Please run <code>npm install -g passionfruit@${latest}</code> in your terminal manually.`
        })
      }
    })
  }

  resumeTarget(){
    this.targetResumed = this.$rpc.resume();
  }

  certPinning(){
    this.$rpc.certpinning().then((unpinned: boolean) => {
      this.unpinned = unpinned;
    })
  }

  jailbreakChecksBypass(){
    this.jbCheckBypass = this.$rpc.jbcheckbypass();
  }

  dumpIPA(){
    this.dumpedIPA = this.$rpc.dumpipa()
  }

  /*dumpEXE(){
    this.dumpedIPA = this.$rpc.dumpipa(0)
  }*/

}
</script>

<style lang="scss" scoped>
menu {
  z-index: 999999;
  padding: 0;
  margin: 0;
  background: #222;

  .menubaritem {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .label {
    font-weight: 100 !important;
  }

  .label:not(:last-child) {
    margin-bottom: 4px !important;
  }

  .menuitem {
    font-weight: 100;
  }
}

h1 {
  display: block;
  float: left;
  margin: 8px 16px 2px 24px;
  font-weight: 100;
}
</style>
