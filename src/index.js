import {accessor, applyDecorators} from 'toxic-decorators';
import {isObject, deepAssign, setStyle, addEvent, removeEvent} from 'chimee-helper';
import './control.css';
import {createChild} from './createchild.js';

/**
 * 插件默认配置
 */
const defaultConfig = {
};

const chimeeControl = {
  name: 'chimeeControl',
  el: 'chimee-control',
  data: {
    children: {}
  },
  level: 99,
  create () {},
  init (videoConfig) {
    if(videoConfig.controls === false) return;
    this.show = true;
    videoConfig.controls = false;
    const _this = this;
    applyDecorators(videoConfig, {
      controls: accessor({
        get () {
          return _this.show;
        },
        set (value) {
          _this.show = Boolean(value);
          _this._display();
          return false;
        }
      }, {preSet: true})
    }, {self: true});
    this.live = videoConfig.type === 'live';
    this.config = isObject(this.$config) ? deepAssign(defaultConfig, this.$config) : defaultConfig;
    this.$dom.innerHTML = '<chimee-control-wrap></chimee-control-wrap>';
    this.$wrap = this.$dom.querySelector('chimee-control-wrap');
    console.log(this.$wrap)
    this.children = createChild(this);
  },
  destroy () {
    for(const i in this.children) {
      this.children[i].destroy();
    }
    this.$dom.parentNode.removeChild(this.$dom);
    window.clearTimeout(this.timeId);
  },
  inited () {
    for(const i in this.children) {
      this.children[i].inited && this.children[i].inited();
    }
  },
  events: {
    play () {
      this.children.play && this.children.play.changeState('play');
      this._hideItself();
    },
    pause () {
      this.children.play && this.children.play.changeState('pause');
      this._showItself();
    },
    load () {
    },
    c_mousemove () {
      this._mousemove();
    },
    durationchange () {
      this.children.progressTime && this.children.progressTime.updateTotal();
    },
    timeupdate () {
      this._progressUpdate();
    },
    progress () {
      this.children.progressBar && this.children.progressBar.progress();
    },
    volumechange () {
      this.children.volume && this.children.volume.update();
    },
    keydown (e) {
      e.stopPropagation();
      switch (e.keyCode) {
        case 32: {
          e.preventDefault();
          this.children.play && this.children.play.click(e);
          break;
        }
        case 37: {
          e.preventDefault();
          const reduceTime = this.currentTime - 10;
          this.currentTime = reduceTime < 0 ? 0 : reduceTime;
          this._mousemove();
          break;
        }
        case 39: {
          e.preventDefault();
          const raiseTime = this.currentTime + 10;
          this.currentTime = raiseTime > this.duration ? this.duration : raiseTime;
          this._mousemove();
          break;
        }
        case 38: {
          e.preventDefault();
          const raiseVolume = this.volume + 0.1;
          this.volume = raiseVolume > 1 ? 1 : raiseVolume;
          this._mousemove();
          break;
        }
        case 40: {
          e.preventDefault();
          const reduceVolume = this.volume - 0.1;
          this.volume = reduceVolume < 0 ? 0 : reduceVolume;
          this._mousemove();
          break;
        }
      }
    },
    click (e) {
      !this.live && this.children.play && this.children.play.click(e);
    },
    dblclick (e) {
      this.dblclick = true;
      this.children.screen && this.children.screen.click();
    }
  },
  methods: {
    _progressUpdate () {
      this.children.progressBar && this.children.progressBar.update();
      this.children.progressTime && this.children.progressTime.updatePass();
    },
    _hideItself () {
      window.clearTimeout(this.timeId);
      this.timeId = setTimeout(() => {
        setStyle(this.$wrap, {
          bottom: '-4em'
        });
        setStyle(this.$dom, {
          visibility: 'hidden'
        });
      }, 2000);
    },
    _showItself () {
      window.clearTimeout(this.timeId);
      setStyle(this.$wrap, {
        bottom: '0'
      });
      setStyle(this.$dom, {
        visibility: 'visible'
      });
    },
    _display () {
      const display = this.show ? 'table' : 'none';
      setStyle(this.$dom, {
        display
      });
    },
    _mousemove (e) {
      if(this.paused) return;
      this._showItself();
      this._hideItself();
    }
  }
};

export default chimeeControl;

