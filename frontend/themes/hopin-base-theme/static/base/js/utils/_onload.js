function OnLoad(f) {
    window.addEventListener('load', f);
    if (document.readyState == 'complete') {
        f();
    }
}
export { OnLoad };
//# sourceMappingURL=_onload.js.map