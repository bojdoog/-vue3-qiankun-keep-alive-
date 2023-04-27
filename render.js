import {
  createApp as _createApp,
  h,
  getCurrentInstance,
  queuePostFlushCb,
} from "vue";
import App from "./App.vue";

const isArray = Array.isArray;

const ShapeFlags = {
  ELEMENT: 1, // 表示一个普通的HTML元素
  FUNCTIONAL_COMPONENT: 1 << 1, // 函数式组件
  STATEFUL_COMPONENT: 1 << 2, // 有状态组件
  TEXT_CHILDREN: 1 << 3, // 子节点是文本
  ARRAY_CHILDREN: 1 << 4, // 子节点是数组
  SLOTS_CHILDREN: 1 << 5, // 子节点是插槽
  TELEPORT: 1 << 6, // 表示vnode描述的是个teleport组件
  SUSPENSE: 1 << 7, // 表示vnode描述的是个suspense组件
  COMPONENT_SHOULD_KEEP_ALIVE: 1 << 8, // 表示需要被keep-live的有状态组件
  COMPONENT_KEPT_ALIVE: 1 << 9, // 已经被keep-live的有状态组件
  // COMPONENT : ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT // 组件，有状态组件和函数式组件的统称
};

const MoveType = {
  ENTER: 0,
  LEAVE: 1,
  REORDER: 2,
};

function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const queuePostRenderEffect = true //__FEATURE_SUSPENSE__
  ? queueEffectWithSuspense
  : queuePostFlushCb;

let app = null;
let instance = null;

const createApp = (instance) => {
  const rootComp = {
    __isKeepAlive: true,
    setup() {
      console.log(1, getCurrentInstance());
      const instance1 = getCurrentInstance();
      const sharedContext = instance1.ctx;
      const parentSuspense = instance1.suspense;

      const {
        renderer: {
          p: patch,
          m: move,
          um: _unmount,
          o: { createElement },
        },
      } = sharedContext;
      sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
        // debugger
        const instance = vnode.component;
        move(vnode, container, anchor, MoveType.ENTER, parentSuspense);
        // in case props have changed
        patch(
          instance.vnode,
          vnode,
          container,
          anchor,
          instance,
          parentSuspense,
          isSVG,
          vnode.slotScopeIds,
          optimized
        );
        queuePostRenderEffect(() => {
          instance.isDeactivated = false;
          if (instance.a) {
            invokeArrayFns(instance.a);
          }
          const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
          if (vnodeHook) {
            invokeVNodeHook(vnodeHook, instance.parent, vnode);
          }
        }, parentSuspense);
      };
      return () => {
        if (instance) {
          console.log(instance, "再次加载时的instance");
          return instance.subTree;
        } else {
          console.log("=================");
          console.log(App);
          return h(App);
        }
      };
    },
  };
  return _createApp(rootComp);
};

const render = () => {
  window.aa = app = createApp(instance);

  app.mount("#app1");
  console.log(app, "app");
};

function uunmount() {
  instance = app._instance;
  instance.subTree.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE;
}

export { render, uunmount };
