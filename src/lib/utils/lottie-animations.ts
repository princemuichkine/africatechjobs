// Static imports for all Lottie animations from src/assets/lottie/
import accessibilityAnimation from "@/assets/lottie/accessibility.json";
import accountAnimation from "@/assets/lottie/account.json";
import analyticsAnimation from "@/assets/lottie/analytics.json";
import apiAnimation from "@/assets/lottie/api.json";
import arrowDownAnimation from "@/assets/lottie/arrow-down.json";
import arrowUpAnimation from "@/assets/lottie/arrow-up.json";
import autorenewAnimation from "@/assets/lottie/autorenew.json";
import blogAnimation from "@/assets/lottie/blog.json";
import boltAnimation from "@/assets/lottie/bolt.json";
import calculateAnimation from "@/assets/lottie/calculate.json";
import calendarAnimation from "@/assets/lottie/calendar.json";
import cardAnimation from "@/assets/lottie/card.json";
import cashAnimation from "@/assets/lottie/cash.json";
import chatAnimation from "@/assets/lottie/chat.json";
import checkAnimation from "@/assets/lottie/check.json";
import codeAnimation from "@/assets/lottie/code.json";
import coinAnimation from "@/assets/lottie/coin.json";
import contactsAnimation from "@/assets/lottie/contacts.json";
import creditCard2Animation from "@/assets/lottie/credit-card-2.json";
import creditCardAnimation from "@/assets/lottie/credit-card.json";
import cubeAnimation from "@/assets/lottie/cube.json";
import downloadAnimation from "@/assets/lottie/download.json";
import extensionAnimation from "@/assets/lottie/extension.json";
import flagAnimation from "@/assets/lottie/flag.json";
import group2Animation from "@/assets/lottie/group-2.json";
import groupAnimation from "@/assets/lottie/group.json";
import helpAnimation from "@/assets/lottie/help.json";
import homeAnimation from "@/assets/lottie/home.json";
import hourglassAnimation from "@/assets/lottie/hourglass.json";
import infoAnimation from "@/assets/lottie/info.json";
import integrationAnimation from "@/assets/lottie/integration.json";
import linkAnimation from "@/assets/lottie/link.json";
import mailAnimation from "@/assets/lottie/mail.json";
import moletteAnimation from "@/assets/lottie/molette.json";
import notificationAnimation from "@/assets/lottie/notification.json";
import phoneAnimation from "@/assets/lottie/phone.json";
import podcastAnimation from "@/assets/lottie/podcast.json";
import pointAnimation from "@/assets/lottie/point.json";
import refreshAnimation from "@/assets/lottie/refresh.json";
import searchAnimation from "@/assets/lottie/search.json";
import settingsAnimation from "@/assets/lottie/settings.json";
import shoppingAnimation from "@/assets/lottie/shopping.json";
import sidepanelAnimation from "@/assets/lottie/sidepanel.json";
import sliderAnimation from "@/assets/lottie/slider.json";
import speedAnimation from "@/assets/lottie/speed.json";
import starAnimation from "@/assets/lottie/star.json";
import storeAnimation from "@/assets/lottie/store.json";
import supportAnimation from "@/assets/lottie/support.json";
import swapAnimation from "@/assets/lottie/swap.json";
import tagAnimation from "@/assets/lottie/tag.json";
import trendingAnimation from "@/assets/lottie/trending.json";
import viewAnimation from "@/assets/lottie/view.json";
import walletAnimation from "@/assets/lottie/wallet.json";
import workAnimation from "@/assets/lottie/work.json";
import profileAnimation from "@/assets/lottie/profile.json";
import loginAnimation from "@/assets/lottie/login.json";
import logoutAnimation from "@/assets/lottie/logout.json";
import mailopenAnimation from "@/assets/lottie/mailopen.json";
import fileplusAnimation from "@/assets/lottie/fileplus.json";
import forumAnimation from "@/assets/lottie/forum.json";
import sunAnimation from "@/assets/lottie/sun.json";
import rainAnimation from "@/assets/lottie/rain.json";
import checkmarkAnimation from "@/assets/lottie/checkmark.json";
import gridAnimation from "@/assets/lottie/grid.json";
import nineGridAnimation from "@/assets/lottie/ninegrid.json";
import luggageAnimation from "@/assets/lottie/luggage.json";
import agendaAnimation from "@/assets/lottie/agenda.json";
import bulbAnimation from "@/assets/lottie/bulb.json";
import carouselAnimation from "@/assets/lottie/carousel.json";
import celebrationAnimation from "@/assets/lottie/celebration.json";
import copyrightAnimation from "@/assets/lottie/copyright.json";
import cutAnimation from "@/assets/lottie/cut.json";
import dailpadAnimation from "@/assets/lottie/dailpad.json";
import discountAnimation from "@/assets/lottie/discount.json";
import email2Animation from "@/assets/lottie/email2.json";
import globeAnimation from "@/assets/lottie/globe.json";
import highpriorityAnimation from "@/assets/lottie/highpriority.json";
import httpAnimation from "@/assets/lottie/http.json";
import landAnimation from "@/assets/lottie/land.json";
import languageAnimation from "@/assets/lottie/language.json";
import lowpriorityAnimation from "@/assets/lottie/lowpriority.json";
import questionAnimation from "@/assets/lottie/question.json";
import scienceAnimation from "@/assets/lottie/science.json";
import sensorAnimation from "@/assets/lottie/sensor.json";
import takeoffAnimation from "@/assets/lottie/takeoff.json";
import trashAnimation from "@/assets/lottie/trash.json";
import upgradeAnimation from "@/assets/lottie/upgrade.json";
import view2Animation from "@/assets/lottie/view2.json";
import view3Animation from "@/assets/lottie/view3.json";
import visibilityAnimation from "@/assets/lottie/visibility.json";
import editAnimation from "@/assets/lottie/edit.json";
import ratioAnimation from "@/assets/lottie/ratio.json";
import crossAnimation from "@/assets/lottie/cross.json";
import filterAnimation from "@/assets/lottie/filter.json";
import playAnimation from "@/assets/lottie/play.json";
import pauseAnimation from "@/assets/lottie/pause.json";

// Lottie animation data type
export interface LottieAnimationData {
  v: string; // version
  fr: number; // frame rate
  ip: number; // in point
  op: number; // out point
  w: number; // width
  h: number; // height
  nm: string; // name
  ddd: number; // 3d
  assets: unknown[];
  layers: unknown[];
  markers?: unknown[];
}

// Export animations directly by name
export const animations = {
  accessibility: accessibilityAnimation,
  account: accountAnimation,
  analytics: analyticsAnimation,
  api: apiAnimation,
  arrowDown: arrowDownAnimation,
  arrowUp: arrowUpAnimation,
  autorenew: autorenewAnimation,
  blog: blogAnimation,
  bolt: boltAnimation,
  calculate: calculateAnimation,
  calendar: calendarAnimation,
  card: cardAnimation,
  cash: cashAnimation,
  chat: chatAnimation,
  check: checkAnimation,
  code: codeAnimation,
  coin: coinAnimation,
  contacts: contactsAnimation,
  creditCard2: creditCard2Animation,
  creditCard: creditCardAnimation,
  cube: cubeAnimation,
  download: downloadAnimation,
  extension: extensionAnimation,
  flag: flagAnimation,
  group2: group2Animation,
  group: groupAnimation,
  help: helpAnimation,
  home: homeAnimation,
  hourglass: hourglassAnimation,
  info: infoAnimation,
  integration: integrationAnimation,
  link: linkAnimation,
  mail: mailAnimation,
  molette: moletteAnimation,
  notification: notificationAnimation,
  phone: phoneAnimation,
  podcast: podcastAnimation,
  point: pointAnimation,
  refresh: refreshAnimation,
  search: searchAnimation,
  settings: settingsAnimation,
  shopping: shoppingAnimation,
  sidepanel: sidepanelAnimation,
  slider: sliderAnimation,
  speed: speedAnimation,
  star: starAnimation,
  store: storeAnimation,
  support: supportAnimation,
  swap: swapAnimation,
  tag: tagAnimation,
  trending: trendingAnimation,
  view: viewAnimation,
  wallet: walletAnimation,
  work: workAnimation,
  profile: profileAnimation,
  login: loginAnimation,
  mailopen: mailopenAnimation,
  fileplus: fileplusAnimation,
  logout: logoutAnimation,
  forum: forumAnimation,
  sun: sunAnimation,
  rain: rainAnimation,
  checkmark: checkmarkAnimation,
  grid: gridAnimation,
  nineGrid: nineGridAnimation,
  luggage: luggageAnimation,
  agenda: agendaAnimation,
  bulb: bulbAnimation,
  carousel: carouselAnimation,
  celebration: celebrationAnimation,
  copyright: copyrightAnimation,
  cut: cutAnimation,
  dailpad: dailpadAnimation,
  discount: discountAnimation,
  email2: email2Animation,
  globe: globeAnimation,
  highpriority: highpriorityAnimation,
  http: httpAnimation,
  land: landAnimation,
  language: languageAnimation,
  lowpriority: lowpriorityAnimation,
  question: questionAnimation,
  science: scienceAnimation,
  sensor: sensorAnimation,
  takeoff: takeoffAnimation,
  trash: trashAnimation,
  upgrade: upgradeAnimation,
  view2: view2Animation,
  view3: view3Animation,
  visibility: visibilityAnimation,
  edit: editAnimation,
  ratio: ratioAnimation,
  cross: crossAnimation,
  filter: filterAnimation,
  play: playAnimation,
  pause: pauseAnimation,
};

// Also export individual animations for direct import
export {
  accessibilityAnimation,
  accountAnimation,
  analyticsAnimation,
  apiAnimation,
  arrowDownAnimation,
  arrowUpAnimation,
  autorenewAnimation,
  blogAnimation,
  boltAnimation,
  calculateAnimation,
  calendarAnimation,
  cardAnimation,
  cashAnimation,
  chatAnimation,
  checkAnimation,
  codeAnimation,
  coinAnimation,
  contactsAnimation,
  creditCard2Animation,
  creditCardAnimation,
  cubeAnimation,
  downloadAnimation,
  extensionAnimation,
  flagAnimation,
  group2Animation,
  groupAnimation,
  helpAnimation,
  homeAnimation,
  hourglassAnimation,
  infoAnimation,
  integrationAnimation,
  linkAnimation,
  mailAnimation,
  moletteAnimation,
  notificationAnimation,
  phoneAnimation,
  podcastAnimation,
  pointAnimation,
  refreshAnimation,
  searchAnimation,
  settingsAnimation,
  shoppingAnimation,
  sidepanelAnimation,
  sliderAnimation,
  speedAnimation,
  starAnimation,
  storeAnimation,
  supportAnimation,
  swapAnimation,
  tagAnimation,
  trendingAnimation,
  viewAnimation,
  walletAnimation,
  workAnimation,
  profileAnimation,
  loginAnimation,
  mailopenAnimation,
  fileplusAnimation,
  logoutAnimation,
  forumAnimation,
  sunAnimation,
  rainAnimation,
  checkmarkAnimation,
  gridAnimation,
  nineGridAnimation,
  luggageAnimation,
  agendaAnimation,
  bulbAnimation,
  carouselAnimation,
  celebrationAnimation,
  copyrightAnimation,
  cutAnimation,
  dailpadAnimation,
  discountAnimation,
  email2Animation,
  globeAnimation,
  highpriorityAnimation,
  httpAnimation,
  landAnimation,
  languageAnimation,
  lowpriorityAnimation,
  questionAnimation,
  scienceAnimation,
  sensorAnimation,
  takeoffAnimation,
  trashAnimation,
  upgradeAnimation,
  view2Animation,
  view3Animation,
  visibilityAnimation,
  editAnimation,
  ratioAnimation,
  crossAnimation,
  filterAnimation,
  playAnimation,
  pauseAnimation,
};
