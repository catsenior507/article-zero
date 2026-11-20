/* 《第零条》图标精灵（运行时注入）
   file:// 下外链 <use href="icons.svg#id"> 会被浏览器拦截，
   因此把同一份 symbol 以内联方式注入 body。
   源文件：assets/icons.svg（两者内容保持一致）。 */
(function () {
  var svg = `
<svg class="sprites" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
  <symbol id="i-dept" viewBox="0 0 24 24"><rect x="9" y="2.5" width="6" height="4.5"/><rect x="2.5" y="17" width="6" height="4.5"/><rect x="15.5" y="17" width="6" height="4.5"/><path d="M12 7v4M5.5 17v-4h13v4"/></symbol>
  <symbol id="i-site" viewBox="0 0 24 24"><path d="M4 20.5V8.5L12 4l8 4.5v12"/><path d="M3.5 20.5h17"/><path d="M9.5 20.5V15h5v5.5"/></symbol>
  <symbol id="i-mtf" viewBox="0 0 24 24"><path d="M12 2.5l8 3.2v5.6c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V5.7z"/><path d="M9 11.8l2.2 2.2 4.3-4.3"/></symbol>
  <symbol id="i-o5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="6.8" r="1.15" fill="currentColor" stroke="none"/><circle cx="16.95" cy="10.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.05" cy="16.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="8.95" cy="16.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="7.05" cy="10.4" r="1.15" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-research" viewBox="0 0 24 24"><path d="M9.5 3v6.4L3.9 19a1.3 1.3 0 0 0 1.1 1.9h14a1.3 1.3 0 0 0 1.1-1.9L14.5 9.4V3"/><path d="M8 3h8"/><path d="M6.7 14.5h10.6"/></symbol>
  <symbol id="i-archive" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14"/><path d="M6 3h12"/><path d="M7.5 10.5h9M7.5 14h6"/></symbol>
  <symbol id="i-diplomacy" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.7 3 2.7 15 0 18M12 3c-2.7 3-2.7 15 0 18"/></symbol>
  <symbol id="i-veil" viewBox="0 0 24 24"><path d="M2.2 12S6 5.6 12 5.6 21.8 12 21.8 12 18 18.4 12 18.4 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="2.7"/></symbol>
  <symbol id="i-contain" viewBox="0 0 24 24"><path d="M3.5 8V3.5H8M20.5 8V3.5H16M3.5 16v4.5H8M20.5 16v4.5H16"/><rect x="8.5" y="8.5" width="7" height="7"/></symbol>
  <symbol id="i-anomaly" viewBox="0 0 24 24"><path d="M1.5 12h4.5l2.3-6.5 4 13 2.3-6.5h4.4"/></symbol>
  <symbol id="i-politics" viewBox="0 0 24 24"><path d="M5.5 21V3.5"/><path d="M5.5 4.5h13l-3.2 4.2 3.2 4.2h-13"/></symbol>
  <symbol id="i-narrative" viewBox="0 0 24 24"><path d="M12 2.5l9.2 4.9-9.2 4.9-9.2-4.9z"/><path d="M2.8 12.4l9.2 4.9 9.2-4.9"/><path d="M2.8 17.1l9.2 4.9 9.2-4.9"/></symbol>
  <symbol id="i-funding" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 6.5v11M9 10.2h6M9 13.8h6"/></symbol>
  <symbol id="i-usd" viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M16 7.6c0-1.9-1.8-3.1-4-3.1s-4 1.2-4 3.1 1.8 2.8 4 3.4 4 1.5 4 3.6-1.8 3.1-4 3.1-4-1.2-4-3.1"/></symbol>
  <symbol id="i-staff" viewBox="0 0 24 24"><circle cx="9" cy="8" r="2.6"/><path d="M3.5 20c0-3 2.4-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2"/><path d="M15.5 20c0-2.4 1.2-3.8 3-3.8s3 1.4 3 3.8"/></symbol>
  <symbol id="i-morale" viewBox="0 0 24 24"><path d="M2.5 13h4l2-5.5 3 10 2.2-4.5h7.8"/></symbol>
  <symbol id="i-capacity" viewBox="0 0 24 24"><path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></symbol>
  <symbol id="i-asset" viewBox="0 0 24 24"><path d="M12 3l8 9-8 9-8-9z"/><circle cx="12" cy="12" r="2"/></symbol>
  <symbol id="i-authority" viewBox="0 0 24 24"><path d="M12 2.8l7.2 4v6.4c0 4.2-3.2 6.8-7.2 8-4-1.2-7.2-3.8-7.2-8V6.8z"/><path d="M9 12l2.2 2.2 4-4"/></symbol>
  <symbol id="i-consensus" viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="2"/><circle cx="18" cy="6.5" r="2"/><circle cx="18" cy="17.5" r="2"/><path d="M7.3 11.1l8.9-3.6M7.3 12.9l8.9 3.6"/></symbol>
  <symbol id="i-contam" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v7M5.3 17.5l6-3.5M18.7 17.5l-6-3.5"/><circle cx="12" cy="12" r="2.2"/></symbol>
  <symbol id="i-seal" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6.2l1.7 3.5h3.8l-3.1 2.4 1.2 3.8L12 13.9l-3.6 2 1.2-3.8-3.1-2.4h3.8z"/></symbol>
  <!-- frames:start -->
  <symbol id="frame-abtn" viewBox="0 0 76 28">
    <defs>
    <linearGradient id="alertFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".34"/>
    <stop offset=".55" stop-color="currentColor" stop-opacity=".16"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".11"/>
    </linearGradient>
    <linearGradient id="alertRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".58"/>
    <stop offset=".32" stop-color="#fff" stop-opacity=".24"/>
    <stop offset=".54" stop-color="#000" stop-opacity=".24"/>
    <stop offset="1" stop-color="#000" stop-opacity=".72"/>
    </linearGradient>
    <linearGradient id="alertPlate" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".44"/>
    <stop offset="1" stop-color="#000" stop-opacity=".26"/>
    </linearGradient>
    </defs>

    <g transform="translate(1 1.5)" fill="#000" opacity=".5">
    <path d="M9 1h59l7 13-7 13H9L2 14z"/>
    </g>

    <path d="M9 1h59l7 13-7 13H9L2 14z" fill="url(#alertFace)"/>
    <path d="M9 1h59l7 13-7 13H9L2 14z" fill="none" stroke="currentColor" stroke-opacity=".42" stroke-width="2.6"/>
    <path d="M9 1h59l7 13-7 13H9L2 14z" fill="none" stroke="url(#alertRim)" stroke-width="1.2"/>

    <path d="M12 4.4h52.6l6 9.6-6 9.6H12L6.4 14z" fill="url(#alertPlate)" stroke="#000" stroke-opacity=".5"/>
    <path d="M12.4 4.9h52l4.4 7" fill="none" stroke="#fff" stroke-opacity=".09"/>

    <rect x="10.6" y="8.5" width="3" height="9" fill="currentColor" opacity=".85"/>
    <rect x="10.6" y="8.5" width="3" height="9" fill="none" stroke="#000" stroke-opacity=".55" stroke-width=".8"/>
    <rect x="11.4" y="9.2" width="1" height="7.6" fill="#fff" opacity=".28"/>

    <circle cx="12.6" cy="2.9" r="1.2" fill="#000" opacity=".6"/>
    <circle cx="12.6" cy="2.9" r=".65" fill="currentColor" opacity=".9"/>
    <circle cx="63.4" cy="2.9" r="1.2" fill="#000" opacity=".6"/>
    <circle cx="63.4" cy="2.9" r=".65" fill="currentColor" opacity=".9"/>
    <circle cx="12.6" cy="25.1" r="1.2" fill="#000" opacity=".6"/>
    <circle cx="12.6" cy="25.1" r=".65" fill="currentColor" opacity=".9"/>
    <circle cx="63.4" cy="25.1" r="1.2" fill="#000" opacity=".6"/>
    <circle cx="63.4" cy="25.1" r=".65" fill="currentColor" opacity=".9"/>

    <path d="M67.6 10.4l2 3.6-2 3.6" fill="none" stroke="currentColor" stroke-opacity=".40" stroke-width="1.1"/>
  </symbol>
  <symbol id="frame-btn" viewBox="0 0 240 44">
    <defs>
    <linearGradient id="actFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".36"/>
    <stop offset=".5" stop-color="currentColor" stop-opacity=".18"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".11"/>
    </linearGradient>
    <linearGradient id="actRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".58"/>
    <stop offset=".30" stop-color="#fff" stop-opacity=".26"/>
    <stop offset=".52" stop-color="#000" stop-opacity=".24"/>
    <stop offset="1" stop-color="#000" stop-opacity=".74"/>
    </linearGradient>
    <linearGradient id="actWell" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".60"/>
    <stop offset="1" stop-color="#000" stop-opacity=".34"/>
    </linearGradient>
    <radialGradient id="actLed" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="currentColor" stop-opacity=".95"/>
    <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
    </radialGradient>
    </defs>

    <path d="M16 4.4h208l14 14v10l-14 14H16L2 28.4v-10z" fill="#000" opacity=".55"/>

    <path d="M16 2h208l14 14v10l-14 14H16L2 28V18z" fill="url(#actFace)"/>
    <path d="M16 2h208l14 14v10l-14 14H16L2 28V18z" fill="none" stroke="currentColor" stroke-opacity=".44" stroke-width="3.4"/>
    <path d="M16 2h208l14 14v10l-14 14H16L2 28V18z" fill="none" stroke="url(#actRim)" stroke-width="1.4"/>

    <path d="M26 11h188M26 15h188M26 19h188M26 23h188M26 27h188M26 31h188" stroke="#fff" stroke-opacity=".026"/>

    <path d="M22 8h196l10 10v8l-10 10H22L12 26v-8z" fill="url(#actWell)" stroke="#000" stroke-opacity=".55"/>
    <path d="M22.6 34.9h194.8" fill="none" stroke="#fff" stroke-opacity=".05"/>

    <path d="M56 13.6h144l6.4 6.4v4l-6.4 6.4H56L49.6 24v-4z" fill="#000" opacity=".38"/>
    <path d="M56 13.6h144l6.4 6.4v4l-6.4 6.4H56L49.6 24v-4z" fill="none" stroke="#000" stroke-opacity=".55"/>
    <path d="M57.2 14.4h141.6l5.4 5.4" fill="none" stroke="#fff" stroke-opacity=".10"/>
    <path d="M57.2 29.2h141.6l5.4-5.4" fill="none" stroke="currentColor" stroke-opacity=".24"/>
    <path d="M47 18.4v3.2M209 18.4v3.2" stroke="currentColor" stroke-opacity=".32" stroke-width="1"/>

    <circle cx="36" cy="22" r="13.4" fill="none" stroke="#000" stroke-opacity=".40"/>
    <circle cx="36" cy="22" r="11.2" fill="#000" opacity=".66"/>
    <circle cx="36" cy="22" r="11.2" fill="none" stroke="currentColor" stroke-opacity=".95" stroke-width="1.3"/>
    <circle cx="36" cy="21.3" r="8.7" fill="none" stroke="#fff" stroke-opacity=".11"/>
    <path d="M33 18.4l4 3.6-4 3.6" fill="none" stroke="currentColor" stroke-opacity=".95" stroke-width="1.4"/>

    <path d="M206 14.6h18v14.8h-18z" fill="#000" opacity=".52"/>
    <path d="M206 14.6h18v14.8h-18z" fill="none" stroke="currentColor" stroke-opacity=".66"/>
    <path d="M206.8 15.4h16.4" stroke="#fff" stroke-opacity=".12"/>
    <circle cx="215" cy="22" r="7.4" fill="url(#actLed)" opacity=".6"/>
    <circle cx="215" cy="22" r="3.1" fill="currentColor"/>
    <circle cx="215" cy="20.9" r="1.05" fill="#fff" opacity=".9"/>

    <g>
    <circle cx="12.5" cy="12.5" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="12.5" cy="12.5" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M11.2 13.8l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    <circle cx="227.5" cy="12.5" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="227.5" cy="12.5" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M226.2 13.8l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    <circle cx="12.5" cy="31.5" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="12.5" cy="31.5" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M11.2 32.8l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    <circle cx="227.5" cy="31.5" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="227.5" cy="31.5" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M226.2 32.8l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    </g>

    <path d="M34 38.4h5M46 38.4h5M58 38.4h5M70 38.4h5M82 38.4h5M94 38.4h5M106 38.4h5M118 38.4h5M130 38.4h5M142 38.4h5M154 38.4h5M166 38.4h5M178 38.4h5M190 38.4h5" stroke="currentColor" stroke-opacity=".24"/>
  </symbol>
  <symbol id="frame-door" viewBox="0 0 210 46">
    <defs>
    <linearGradient id="doorFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".30"/>
    <stop offset=".5" stop-color="currentColor" stop-opacity=".15"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".09"/>
    </linearGradient>
    <linearGradient id="doorRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".58"/>
    <stop offset=".30" stop-color="#fff" stop-opacity=".22"/>
    <stop offset=".52" stop-color="#000" stop-opacity=".26"/>
    <stop offset="1" stop-color="#000" stop-opacity=".74"/>
    </linearGradient>
    <linearGradient id="doorWell" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".60"/>
    <stop offset="1" stop-color="#000" stop-opacity=".34"/>
    </linearGradient>
    <radialGradient id="doorLed" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="currentColor" stop-opacity=".95"/>
    <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
    </radialGradient>
    </defs>

    <path d="M14 4.2h182l12 12v18l-12 12H14L2 34.2v-18z" fill="#000" opacity=".52"/>

    <path d="M14 2h182l12 12v18l-12 12H14L2 32V14z" fill="url(#doorFace)"/>
    <path d="M14 2h182l12 12v18l-12 12H14L2 32V14z" fill="none" stroke="currentColor" stroke-opacity=".40" stroke-width="3.2"/>
    <path d="M14 2h182l12 12v18l-12 12H14L2 32V14z" fill="none" stroke="url(#doorRim)" stroke-width="1.3"/>

    <path d="M16 6h178l10 10v14l-10 10H16L6 30V16z" fill="url(#doorWell)" stroke="#000" stroke-opacity=".52"/>
    <path d="M16.6 39.4h178" fill="none" stroke="#fff" stroke-opacity=".05"/>

    <circle cx="27" cy="23" r="12.4" fill="none" stroke="#000" stroke-opacity=".38"/>
    <circle cx="27" cy="23" r="10.6" fill="#000" opacity=".64"/>
    <circle cx="27" cy="23" r="10.6" fill="none" stroke="currentColor" stroke-opacity=".80" stroke-width="1.1"/>
    <circle cx="27" cy="22.4" r="8.2" fill="none" stroke="#fff" stroke-opacity=".09"/>

    <path d="M187 14.6h12v16.8h-12z" fill="#000" opacity=".50"/>
    <path d="M187 14.6h12v16.8h-12z" fill="none" stroke="currentColor" stroke-opacity=".55"/>
    <circle cx="193" cy="23" r="6.4" fill="url(#doorLed)" opacity=".55"/>
    <circle cx="193" cy="23" r="2.5" fill="currentColor"/>
    <circle cx="193" cy="22" r=".9" fill="#fff" opacity=".85"/>

    <circle cx="10.6" cy="10.6" r="1.9" fill="#000" opacity=".55"/>
    <circle cx="10.6" cy="10.6" r="1.9" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M9.6 11.6l2-2" stroke="#000" stroke-opacity=".65" stroke-width=".8"/>
    <circle cx="199.4" cy="10.6" r="1.9" fill="#000" opacity=".55"/>
    <circle cx="199.4" cy="10.6" r="1.9" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M198.4 11.6l2-2" stroke="#000" stroke-opacity=".65" stroke-width=".8"/>
    <circle cx="10.6" cy="35.4" r="1.9" fill="#000" opacity=".55"/>
    <circle cx="10.6" cy="35.4" r="1.9" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M9.6 36.4l2-2" stroke="#000" stroke-opacity=".65" stroke-width=".8"/>
    <circle cx="199.4" cy="35.4" r="1.9" fill="#000" opacity=".55"/>
    <circle cx="199.4" cy="35.4" r="1.9" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M198.4 36.4l2-2" stroke="#000" stroke-opacity=".65" stroke-width=".8"/>

    <path d="M100 39.4h6M112 39.4h6M124 39.4h6M136 39.4h6M148 39.4h6" stroke="currentColor" stroke-opacity=".22"/>
  </symbol>
  <symbol id="frame-rail" viewBox="0 0 46 46">
    <defs>
    <linearGradient id="railFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".34"/>
    <stop offset=".55" stop-color="currentColor" stop-opacity=".16"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".10"/>
    </linearGradient>
    <linearGradient id="railRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".58"/>
    <stop offset=".30" stop-color="#fff" stop-opacity=".28"/>
    <stop offset=".52" stop-color="#000" stop-opacity=".22"/>
    <stop offset="1" stop-color="#000" stop-opacity=".72"/>
    </linearGradient>
    <linearGradient id="railWell" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".62"/>
    <stop offset=".62" stop-color="#000" stop-opacity=".30"/>
    <stop offset="1" stop-color="#000" stop-opacity=".42"/>
    </linearGradient>
    <radialGradient id="railHalo" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="currentColor" stop-opacity=".16"/>
    <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
    </radialGradient>
    </defs>

    <g transform="translate(.9 1.4)" fill="#000" opacity=".5">
    <path d="M12 1h22l11 11v22L34 45H12L1 34V12z"/>
    </g>

    <path d="M12 1h22l11 11v22L34 45H12L1 34V12z" fill="url(#railFace)"/>
    <path d="M12 1h22l11 11v22L34 45H12L1 34V12z" fill="none" stroke="currentColor" stroke-opacity=".42" stroke-width="3"/>
    <path d="M12 1h22l11 11v22L34 45H12L1 34V12z" fill="none" stroke="url(#railRim)" stroke-width="1.3"/>

    <path d="M1.6 17h3.6v12H1.6z" fill="#000" opacity=".62"/>
    <path d="M1.6 17h3.6v12H1.6z" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M3.4 19v8" stroke="currentColor" stroke-opacity=".38" stroke-width=".8"/>

    <path d="M13.9 5.6h18.2l8.3 8.3v18.2l-8.3 8.3H13.9l-8.3-8.3V13.9z" fill="url(#railWell)" stroke="#000" stroke-opacity=".55"/>
    <path d="M13.9 14.2v17.4l7.6 7.6" fill="none" stroke="#fff" stroke-opacity=".07"/>
    <circle cx="23" cy="21.6" r="10.4" fill="url(#railHalo)"/>

    <g>
    <circle cx="12" cy="12" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="12" cy="12" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M10.7 13.3l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    <circle cx="34" cy="12" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="34" cy="12" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M32.7 13.3l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    <circle cx="12" cy="34" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="12" cy="34" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M10.7 35.3l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    <circle cx="34" cy="34" r="2.3" fill="#000" opacity=".6"/>
    <circle cx="34" cy="34" r="2.3" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M32.7 35.3l2.6-2.6" stroke="#000" stroke-opacity=".7" stroke-width=".9"/>
    </g>

    <rect x="16" y="33.2" width="14" height="4.8" fill="#000" opacity=".62"/>
    <rect x="16" y="33.2" width="14" height="4.8" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width=".8"/>
    <path d="M16.5 33.7h13" stroke="#fff" stroke-opacity=".08"/>
  </symbol>
  <symbol id="frame-mode" viewBox="0 0 36 36">
    <defs>
    <linearGradient id="modeFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".32"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".10"/>
    </linearGradient>
    <linearGradient id="modeRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".58"/>
    <stop offset=".32" stop-color="#fff" stop-opacity=".24"/>
    <stop offset=".54" stop-color="#000" stop-opacity=".24"/>
    <stop offset="1" stop-color="#000" stop-opacity=".72"/>
    </linearGradient>
    <linearGradient id="modeWell" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".62"/>
    <stop offset="1" stop-color="#000" stop-opacity=".38"/>
    </linearGradient>
    <radialGradient id="modeGlow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="currentColor" stop-opacity=".9"/>
    <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
    </radialGradient>
    </defs>

    <g transform="translate(.8 1.2)" fill="#000" opacity=".48">
    <path d="M10 1h16l9 9v16l-9 9H10L1 26V10z"/>
    </g>

    <path d="M10 1h16l9 9v16l-9 9H10L1 26V10z" fill="url(#modeFace)"/>
    <path d="M10 1h16l9 9v16l-9 9H10L1 26V10z" fill="none" stroke="currentColor" stroke-opacity=".42" stroke-width="2.8"/>
    <path d="M10 1h16l9 9v16l-9 9H10L1 26V10z" fill="none" stroke="url(#modeRim)" stroke-width="1.2"/>

    <path d="M11.6 4.8h12.8l6.8 6.8v12.8l-6.8 6.8H11.6L4.8 24.4V11.6z" fill="url(#modeWell)" stroke="#000" stroke-opacity=".52"/>

    <path d="M2.6 14v8M33.4 14v8" stroke="currentColor" stroke-opacity=".42" stroke-width="1"/>
    <path d="M2.6 16.4v3.2M33.4 16.4v3.2" stroke="#000" stroke-opacity=".45" stroke-width=".8"/>

    <rect x="12" y="26.4" width="12" height="4.2" fill="#000" opacity=".68"/>
    <rect x="12" y="26.4" width="12" height="4.2" fill="none" stroke="currentColor" stroke-opacity=".42" stroke-width=".8"/>
    <circle cx="18" cy="28.5" r="3.2" fill="url(#modeGlow)" opacity=".75"/>
    <circle cx="18" cy="28.5" r="1.35" fill="currentColor"/>
    <circle cx="17.6" cy="28.1" r=".5" fill="#fff" opacity=".95"/>
  </symbol>
  <symbol id="frame-gear" viewBox="0 0 28 28">
    <defs>
    <linearGradient id="gearFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".30"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".10"/>
    </linearGradient>
    <linearGradient id="gearRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".58"/>
    <stop offset=".34" stop-color="#fff" stop-opacity=".22"/>
    <stop offset=".56" stop-color="#000" stop-opacity=".24"/>
    <stop offset="1" stop-color="#000" stop-opacity=".70"/>
    </linearGradient>
    </defs>

    <g transform="translate(.7 1.1)" fill="#000" opacity=".46">
    <path d="M8 1h12l7 7v12l-7 7H8l-7-7V8z"/>
    </g>

    <path d="M8 1h12l7 7v12l-7 7H8l-7-7V8z" fill="url(#gearFace)"/>
    <path d="M8 1h12l7 7v12l-7 7H8l-7-7V8z" fill="none" stroke="currentColor" stroke-opacity=".38" stroke-width="2.4"/>
    <path d="M8 1h12l7 7v12l-7 7H8l-7-7V8z" fill="none" stroke="url(#gearRim)" stroke-width="1.1"/>

    <path d="M9.3 4.2h9.4l5.5 5.5v9.4l-5.5 5.5H9.3L3.8 19.1V9.7z" fill="none" stroke="#000" stroke-opacity=".42"/>

    <circle cx="14" cy="14" r="7.4" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width=".9"/>
  </symbol>
  <symbol id="frame-stamp" viewBox="0 0 150 52">
    <defs>
    <linearGradient id="stampFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".32"/>
    <stop offset=".52" stop-color="currentColor" stop-opacity=".15"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".10"/>
    </linearGradient>
    <linearGradient id="stampRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".58"/>
    <stop offset=".30" stop-color="#fff" stop-opacity=".26"/>
    <stop offset=".54" stop-color="#000" stop-opacity=".26"/>
    <stop offset="1" stop-color="#000" stop-opacity=".74"/>
    </linearGradient>
    </defs>

    <g transform="translate(1.4 2.2)" fill="#000" opacity=".52">
    <path d="M18 2h114l16 14v16l-16 14H18L2 32V16z"/>
    </g>

    <path d="M18 2h114l16 14v16l-16 14H18L2 32V16z" fill="url(#stampFace)"/>
    <path d="M18 2h114l16 14v16l-16 14H18L2 32V16z" fill="none" stroke="currentColor" stroke-opacity=".46" stroke-width="3.6"/>
    <path d="M18 2h114l16 14v16l-16 14H18L2 32V16z" fill="none" stroke="url(#stampRim)" stroke-width="1.9"/>

    <path d="M22 6h106l13.4 11.8v16.4L128 46H22L8.6 34.2V17.8z" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1"/>
    <path d="M26 10h98l11 9.8v12.4L124 42H26L15 32.2V19.8z" fill="none" stroke="currentColor" stroke-opacity=".20"/>

    <rect x="58" y="2" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="68" y="2" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="78" y="2" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="88" y="2" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="98" y="2" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="58" y="45.6" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="68" y="45.6" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="78" y="45.6" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="88" y="45.6" width="3" height="4.4" fill="#000" opacity=".65"/>
    <rect x="98" y="45.6" width="3" height="4.4" fill="#000" opacity=".65"/>

    <circle cx="12.6" cy="26" r="2.7" fill="#000" opacity=".65"/>
    <circle cx="12.6" cy="26" r="2.7" fill="none" stroke="currentColor" stroke-opacity=".62" stroke-width="1"/>
    <path d="M12.6 24.2v3.6" stroke="#000" stroke-opacity=".72" stroke-width=".9"/>
    <circle cx="137.4" cy="26" r="2.7" fill="#000" opacity=".65"/>
    <circle cx="137.4" cy="26" r="2.7" fill="none" stroke="currentColor" stroke-opacity=".62" stroke-width="1"/>
    <path d="M137.4 24.2v3.6" stroke="#000" stroke-opacity=".72" stroke-width=".9"/>
  </symbol>
  <symbol id="frame-card" viewBox="0 0 250 62">
    <path d="M1 14L15 1H205L249 45V61H1z" fill="currentColor" fill-opacity=".05"/>
    <path d="M1 14L15 1H205L249 45V61H1z" fill="none" stroke="currentColor" stroke-width="1"/>
    <path d="M205 1L249 45" fill="none" stroke="currentColor" stroke-width=".8" opacity=".6"/>
    <path d="M20 9v44" stroke="currentColor" stroke-width=".6" opacity=".3"/>
    <circle cx="9" cy="22" r="1" fill="currentColor" opacity=".45"/>
    <circle cx="9" cy="32" r="1" fill="currentColor" opacity=".45"/>
    <circle cx="9" cy="42" r="1" fill="currentColor" opacity=".45"/>
  </symbol>
  <symbol id="frame-tab" viewBox="0 0 124 40">
    <defs>
    <linearGradient id="tabFace" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".26"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".08"/>
    </linearGradient>
    </defs>
    <path d="M12 3h112v36H3V15z" fill="#000" opacity=".4"/>
    <path d="M12 1h112v38H1V15z" fill="url(#tabFace)" stroke="currentColor" stroke-width="1.1"/>
    <path d="M13 3h110" stroke="#fff" stroke-opacity=".15"/>
    <path d="M6 8h112" stroke="#000" stroke-opacity=".35"/>
    <path d="M2 37.5h120" stroke="currentColor" stroke-opacity=".6"/>
    <circle cx="8" cy="22" r="1.4" fill="#000" opacity=".5"/>
    <circle cx="7.6" cy="21.6" r=".9" fill="currentColor" opacity=".8"/>
  </symbol>
  <!-- frames:end -->
</svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
})();
