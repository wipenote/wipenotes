  // Cool way to render Vue components from HTML Strings
  // https://medium.com/haiiro-io/compile-markdown-as-vue-template-on-nuxt-js-1c606c15731c
  import Vue from 'vue'

  import VueWithCompiler from "vue/dist/vue.esm";
  import {validateEmail, validateUrl} from "../utils";
  import * as WAValidator from "wallet-address-validator";
  import * as xss from "xss";
  
  export default Vue.component('CompiledHtml', {
    props: {
      text: {
        type: String,
        default: "",
      },
    },
    data() {
      return {
        html: '',
        templateRender: undefined,
      };
    },
    watch: {
      text(txt) {
        const clearedXSS = xss(txt)
        console.log('xss', clearedXSS)
        this.html = this.replaceHtmlText(clearedXSS)
        this.$nextTick(() => {
          this.updateRender();
        })
      },
    },
    created() {
      this.updateRender();
    },
    methods: {
      getCryptoIconWithPopover({address, tokenKey, linkAddressExplorer, popoverLinkText, icon}) {
        const randomNumber = Math.round(Math.random() * 100000)
        let bitcoinStr =
          `<span class="link_${tokenKey}">${address}</span>`
        bitcoinStr += `<span :id="'${tokenKey}-${address}-${randomNumber}'" class="crypto-address"><i class="fab ${icon}"></i></span>`
        bitcoinStr += `<b-popover :target="'${tokenKey}-${address}-${randomNumber}'" placement="top" triggers="hover">`
        bitcoinStr += `<a class="note-popover-link" href="${linkAddressExplorer}" target="_blank">${popoverLinkText}</a>`
        bitcoinStr += `</b-popover>`
  
        return bitcoinStr
      },
      getRecognizedWordHtml(word) {
        if (validateEmail(word)) {
          const randomNumber = Math.round(Math.random() * 100000)
          let mailStr =
            `<span class="link_mail">${word}</span>`
          mailStr += `<span :id="'maillink-${randomNumber}'" class="crypto-address"><i class="fas fa-at"></i></span>`
          mailStr += `<b-popover :target="'maillink-${randomNumber}'" placement="top" triggers="hover">`
          mailStr += `<a class="note-popover-link" href="mailto:${word}" target="_blank">send mail to ${word}</a>`
          mailStr += `</b-popover>`
          
          return mailStr
        }

        const bitcoinPopovers = []

        if (WAValidator.validate(word, 'BTC')) {
          const bitcoinStr = this.getCryptoIconWithPopover({
            address: word,
            tokenKey: 'btc',
            linkAddressExplorer: `https://www.blockchain.com/btc/address/${word}`,
            popoverLinkText: 'view on blockchain.com',
            icon: 'fa-btc'
          })
          
          return bitcoinStr
        }
        
        if (WAValidator.validate(word, 'ETH')) {
          const ethStr = this.getCryptoIconWithPopover({
            address: word,
            tokenKey: 'btc',
            linkAddressExplorer: `https://etherscan.io/address/${word}`,
            popoverLinkText: 'view on etherscan.io',
            icon: 'fa-ethereum'
          })
          return ethStr
        }
        
        if (WAValidator.validate(word, 'BTG')) {
          const btgStr = this.getCryptoIconWithPopover({
            address: word,
            tokenKey: 'btg',
            linkAddressExplorer: `https://explorer.bitcoingold.org/insight/address/${word}`,
            popoverLinkText: 'view on bitcoingold.org',
            icon: 'fa-bitcoin',
          })
          return btgStr
        }
        
        if (validateUrl(word)) {
          return `<a href="${word}">${word}</a>`
        }
        
        return `${word}`
      },
      replaceHtmlText(text) {
        const items = []
        for (let item of text.matchAll(/\S+/ig)) {
          items.push(item)
        }

        let htmlContent = text.replace(/\S+/ig, (s, content) => {
          return this.getRecognizedWordHtml(s)
        })

        htmlContent = htmlContent.replace(/[\n\r]/ig, (s, content) => {
          return `<div>${s}</div>`
        })
        
        return `<div class="note-html-content">${htmlContent}</div>`
      },
      updateRender() {
        const compiled = Vue.compile(this.html);
        this.templateRender = compiled.render;
        this.$options.staticRenderFns = [];
        
        for (const staticRenderFunction of compiled.staticRenderFns) {
          this.$options.staticRenderFns.push(staticRenderFunction);
        }
        
      },
    },
    render() {
      return this.templateRender();
    },
  });
