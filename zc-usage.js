/*
 * Zip-Clip tool usage tracking
 * ----------------------------
 * Add this one line to any tool, just before </body>, changing data-tool to that tool's id
 * from the dashboard's Tools tab:
 *
 *   <script src="https://kayleighparsons.github.io/MarketingTracker/zc-usage.js" data-tool="prequote"></script>
 *
 * It records one "open" each time someone opens the tool. To record something they did,
 * call for example:  ZCUsage.track("quote_created", "KP000124")
 * Links from All Access add ?src=allaccess&u=<their username>, so opens show who used it.
 * If a tool knows who is using it (e.g. rep initials), call ZCUsage.setUser("KP").
 */
(function () {
  var s = document.currentScript;
  var tool = s && s.getAttribute("data-tool");
  if (!tool) return;
  var ENDPOINT = s.getAttribute("data-endpoint") || "https://script.google.com/macros/s/AKfycbx-cZ6y8VrTAgUn4IoxbjV4asC3VVbA2F222VSbJRqqcg-iNjPodE8T86xmyq5SApGn/exec";
  var q = new URLSearchParams(location.search);
  var user = q.get("u") || "";
  try { if (user) localStorage.setItem("zcu_user", user); else user = localStorage.getItem("zcu_user") || ""; } catch (e) {}
  var source = q.get("src") || (document.referrer ? (function () { try { return new URL(document.referrer).hostname; } catch (e) { return "link"; } })() : "direct");

  function send(event, detail) {
    var body = JSON.stringify({ action: "track", tool: tool, event: event || "open", user: user, source: source, detail: detail ? String(detail) : "" });
    try { if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }))) return; } catch (e) {}
    try { fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: body, keepalive: true }); } catch (e) {}
  }
  window.ZCUsage = {
    track: send,
    setUser: function (u) { user = String(u || "").slice(0, 60); try { localStorage.setItem("zcu_user", user); } catch (e) {} }
  };
  // One "open" per browser tab, so refreshing doesn't inflate the count.
  try { if (!sessionStorage.getItem("zcu_open_" + tool)) { sessionStorage.setItem("zcu_open_" + tool, "1"); send("open"); } }
  catch (e) { send("open"); }
})();
