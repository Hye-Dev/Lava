function powerAction(req, res) {
  const axios = require("axios").default;
  var client = axios.create({
    socketPath: "/var/snap/lxd/common/lxd/unix.socket",
  });
  if (req.body.type == "KVM" || req.body.type == "N-VPS") {
    if (req.body.state == "kill") {
      client
        .put(`/1.0/instances/${req.params.uuid}/state`, {
          action: "stop",
          force: true,
          stateful: false,
          timeout: 30,
        })
        .then(() => {
          res.status(200).json({
            status: "success",
            data: `State action ${req.body.state} successfully executed.`,
          });
        })
        .catch((err) => {
          res.status(502).json({ status: "error", data: err });
        });
    } else {
      client
        .put(`/1.0/instances/${req.params.uuid}/state`, {
          action: req.body.state,
          force: false,
          stateful: false,
          timeout: 30,
        })
        .then(() => {
          res.status(200).json({
            status: "success",
            data: `State action ${req.body.state} successfully executed.`,
          });
        })
        .catch((err) => {
          res.status(502).json({ status: "error", data: err });
        });
    }
  } else if (req.body.type == "docker") {
    const DockerClient = new (require("dockerode"))();
    var s = DockerClient.getContainer(req.params.uuid);
    if (
      req.body.state == "start" ||
      req.body.state == "restart" ||
      req.body.state == "stop" ||
      req.body.state == "kill"
    ) {
      s[req.body.state]({}, () => {
        res.status(200).json({
          status: "success",
          data: "State action " + req.body.state + " successfully executed.",
        });
      });
    } else {
      res
        .status(502)
        .json({ status: "error", data: "State action not valid." });
    }
  } else {
    res.status(400).json({ status: "error", data: "Invalid Server Type" });
  }
}
module.exports = { powerAction };
