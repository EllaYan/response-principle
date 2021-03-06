
    function observe (obj, vm) {
      Object.keys(obj).forEach(function (key) {
        console.log('observe()')
        defineReactive(vm, key, obj[key]);//为每一个数据添加一个dep
      })
    }

    function defineReactive (obj, key, val) {
      var dep = new Dep();
      console.log('defineReactive()')
      Object.defineProperty(obj, key, {
        get: function () {
          console.log('defineReactive()中get()')
          // 添加订阅者 watcher 到主题对象 Dep
          if (Dep.target) dep.addSub(Dep.target);
          return val
        },
        set: function (newVal) {
          console.log('defineReactive()中set()')
          if (newVal === val) return
          val = newVal;
          // 作为发布者发出通知
          dep.notify();
        }
      });
    }

    function nodeToFragment (node, vm) {
      var flag = document.createDocumentFragment();
      var child;
      console.log('nodeToFragment()')
      // 当node有子节点时执行下面操作
      while (child = node.firstChild) {
        compile(child, vm);
        flag.appendChild(child);
        // appendChild()可以将一个元素移除到另一个元素中去，执行完后node中已经没有当前的firstChild，而是下一个
      }

      return flag
    }

    function compile (node, vm) {
      console.log('compile()')
      var reg = /\{\{(.*)\}\}/;// 在全局匹配{{ }}
      // 节点类型为元素
      if (node.nodeType === 1) {
        var attr = node.attributes;
        // 解析属性
        for (var i = 0; i < attr.length; i++) {
          if (attr[i].nodeName == 'v-model') {
            var name = attr[i].nodeValue; // 获取 v-model 绑定的属性名
            node.addEventListener('input', function (e) {
              // 给相应的 data 属性赋值，进而触发该属性的 set 方法
              vm[name] = e.target.value;
            });
            node.value = vm[name]; // 将 data 的值赋给该 node
            node.removeAttribute('v-model');
          }
        };

        new Watcher(vm, node, name, 'input');
      }
      // 节点类型为 text
      if (node.nodeType === 3) {
        if (reg.test(node.nodeValue)) {
          var name = RegExp.$1; // 获取匹配到的字符串
          name = name.trim();

          new Watcher(vm, node, name, 'text');
        }
      }
    }

    function Watcher (vm, node, name, nodeType) {
      Dep.target = this;
      this.name = name;
      this.node = node;
      this.vm = vm;
      this.nodeType = nodeType;
      this.update();
      Dep.target = null;
    }

    Watcher.prototype = {
      update: function () {
        console.log('watcher的update()')
        this.get();
        if (this.nodeType == 'text') {
          this.node.nodeValue = this.value;
        }
        if (this.nodeType == 'input') {
          this.node.value = this.value;
        }
      },
      // 获取 data 中的属性值
      get: function () {
        console.log('watcher的get()')
        this.value = this.vm[this.name]; // 触发相应属性的 get
      }
    }

    function Dep () {
      this.subs = []
    }

    Dep.prototype = {
      addSub: function(sub) {
        console.log('dep的addsub()')
        this.subs.push(sub);
      },

      notify: function() {
        console.log('dep的notify()')
        this.subs.forEach(function(sub) {
          sub.update();
        });
      }
    }

    function Vue (options) {
      this.data = options.data;
      var data = this.data;// 简化Vue源码中的_innitData()方法，获得data

      observe(data, this);

      var id = options.el;
      var dom = nodeToFragment(document.getElementById(id), this);

      // 编译完成后，将 dom 返回到 app 中
      document.getElementById(id).appendChild(dom); 
    }

    var vm = new Vue({
      el: 'app',
      data: {
        text: 'hello world',
        enen: ''
      }
    })
