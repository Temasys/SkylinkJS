export default function (fn) {
  let self = this;
  let called = false;

  this.trigger = function (params) {
    if(called) return;

    fn.apply(self, arguments);
    called = true;
  };
}