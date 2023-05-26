"use strict";

require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.weak-map.js");
require("core-js/modules/web.dom-collections.iterator.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PLUGIN_NAME = exports.PLATFORM_NAME = exports.ESP8266IntexSBH20 = void 0;
require("core-js/modules/es.regexp.to-string.js");
require("core-js/modules/es.parse-float.js");
require("core-js/modules/es.promise.js");
var mqtt = _interopRequireWildcard(require("mqtt"));
var _events = _interopRequireDefault(require("events"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var PLATFORM_NAME = 'HomebridgeESP8266IntexSBH20';
exports.PLATFORM_NAME = PLATFORM_NAME;
var PLUGIN_NAME = 'homebridge-esp8266-intexsbh20';
exports.PLUGIN_NAME = PLUGIN_NAME;
var TOPICS = {
  BUBBLE: "pool/bubble",
  ERROR: "pool/error",
  FILTER: "pool/filter",
  HEATER: "pool/heater",
  MODEL: "pool/model",
  POWER: "pool/power",
  WATER_ACT: "pool/water/tempAct",
  WATER_SET: "pool/water/tempSet",
  VERSION: "wifi/version",
  IP: "wifi/ip",
  RSSI: "wifi/rssi",
  WIFI_TEMP: "wifi/temp",
  STATE: "wifi/state",
  CMD_BUBBLE: "pool/command/bubble",
  CMD_FILTER: "pool/command/filter",
  CMD_HEATER: "pool/command/heater",
  CMD_POWER: "pool/command/power",
  CMD_WATER: "pool/command/water/tempSet",
  CMD_OTA: "wifi/command/update"
};
class ESP8266IntexSBH20 extends _events.default {
  constructor(log, config, api) {
    var _this;
    super();
    _this = this;
    this.log = log;
    this.config = config;
    this.api = api;
    this.client = mqtt.connect("mqtt://".concat(this.config.host));
    this.accessories = [];
    this.data = {
      power: false,
      bubble: false,
      heater: false,
      filter: false,
      current_temp: 20,
      target_temp: 40,
      external_temp: -75
    };
    api.on("didFinishLaunching", /*#__PURE__*/_asyncToGenerator(function* () {
      _this.log.info("didFinishLaunching");
      _this.client.on('connect', function (cl) {
        this.subscribe(TOPICS.BUBBLE);
        this.subscribe(TOPICS.ERROR);
        this.subscribe(TOPICS.FILTER);
        this.subscribe(TOPICS.HEATER);
        this.subscribe(TOPICS.MODEL);
        this.subscribe(TOPICS.POWER);
        this.subscribe(TOPICS.WATER_ACT);
        this.subscribe(TOPICS.WATER_SET);
        this.subscribe(TOPICS.VERSION);
        this.subscribe(TOPICS.IP);
        this.subscribe(TOPICS.RSSI);
        this.subscribe(TOPICS.WIFI_TEMP);
        this.subscribe(TOPICS.STATE);
      });
      _this.client.on('message', function (topic, message) {
        var msg = message.toString();
        this.log.debug(topic, msg);
        switch (topic) {
          case TOPICS.BUBBLE:
            this.data.bubble = msg === "on";
            this.emit('bubble', this.data.bubble);
            break;
          case TOPICS.ERROR:
            break;
          case TOPICS.FILTER:
            this.data.filter = msg === "on";
            this.emit('filter', this.data.filter);
            break;
          case TOPICS.HEATER:
            this.data.heater = msg === "on";
            this.emit('heater', this.data.heater);
            break;
          case TOPICS.MODEL:
            break;
          case TOPICS.POWER:
            this.data.power = msg === "on";
            this.emit('power', this.data.power);
            break;
          case TOPICS.WATER_ACT:
            this.data.current_temp = parseFloat(msg);
            this.emit('current_temp', this.data.current_temp);
            break;
          case TOPICS.WATER_SET:
            this.data.target_temp = parseFloat(msg);
            this.emit('target_temp', this.data.target_temp);
            break;
          case TOPICS.VERSION:
            break;
          case TOPICS.IP:
            break;
          case TOPICS.RSSI:
            break;
          case TOPICS.WIFI_TEMP:
            this.data.external_temp = parseFloat(msg);
            this.emit('external_temp', this.data.external_temp);
            break;
          case TOPICS.STATE:
            break;
        }
      }.bind(_this));
      var uuid = api.hap.uuid.generate('homebridge:esp8266-intexsbh20');

      // check the accessory was not restored from cache
      if (!_this.accessories.find(accessory => accessory.UUID === uuid)) {
        var accessory = new _this.api.platformAccessory('Intex SPA', uuid);
        _this.configureAccessory(accessory);
        _this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }));
  }
  configureAccessory(accessory) {
    this.accessories.push(accessory);
    accessory.category = this.api.hap.Categories.THERMOSTAT;
    accessory.displayName = 'Intex SPA';
    var service_information = accessory.getService(this.api.hap.Service.AccessoryInformation);
    service_information.setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Intex").setCharacteristic(this.api.hap.Characteristic.Model, "SBH20").setCharacteristic(this.api.hap.Characteristic.Name, "ESP8266 Intex SBH20").setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, "1.0.0");

    ////// THERMOSTAT //////

    var service_thermostat = accessory.getService(this.api.hap.Service.Thermostat);
    if (!service_thermostat) {
      service_thermostat = accessory.addService(this.api.hap.Service.Thermostat);
    }
    service_thermostat.removeCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity);
    service_thermostat.removeCharacteristic(this.api.hap.Characteristic.TargetRelativeHumidity);
    var characteristic_currentHeatingCoolingState = service_thermostat.getCharacteristic(this.api.hap.Characteristic.CurrentHeatingCoolingState);
    characteristic_currentHeatingCoolingState.setProps({
      minStep: 1,
      minValue: this.api.hap.Characteristic.TargetHeatingCoolingState.OFF,
      maxValue: this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT,
      validValues: [this.api.hap.Characteristic.TargetHeatingCoolingState.OFF, this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT]
    });
    var characteristic_targetHeatingCoolingState = service_thermostat.getCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState);
    characteristic_targetHeatingCoolingState.setProps({
      minStep: 1,
      minValue: this.api.hap.Characteristic.TargetHeatingCoolingState.OFF,
      maxValue: this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT,
      validValues: [this.api.hap.Characteristic.TargetHeatingCoolingState.OFF, this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT]
    });
    characteristic_targetHeatingCoolingState.onGet(this.heatingOnGet.bind(this));
    characteristic_targetHeatingCoolingState.onSet(this.heatingOnSet.bind(this));
    this.on('heater', value => {
      this.log.info('onHeater', value);
      this.data.heater = value;
      service_thermostat.updateCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState, value ? this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT : this.api.hap.Characteristic.TargetHeatingCoolingState.OFF);
    });
    var characteristic_targetTemperature = service_thermostat.getCharacteristic(this.api.hap.Characteristic.TargetTemperature);
    characteristic_targetTemperature.setProps({
      minStep: 1,
      minValue: 20,
      maxValue: 40
    });
    characteristic_targetTemperature.onGet(this.targetTempOnGet.bind(this));
    characteristic_targetTemperature.onSet(this.targetTempOnSet.bind(this));
    this.on('target_temp', value => {
      this.log.info('onTargetTemp', value);
      this.data.target_temp = value;
      service_thermostat.updateCharacteristic(this.api.hap.Characteristic.TargetTemperature, value);
    });
    var characteristic_currentTemperature = service_thermostat.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature);
    characteristic_currentTemperature.setProps({
      minStep: 1,
      minValue: 20,
      maxValue: 40
    });
    characteristic_currentTemperature.onGet(this.currentTempOnGet.bind(this));
    this.on('current_temp', value => {
      this.log.info('onCurrentTemp', value);
      this.data.current_temp = value;
      service_thermostat.updateCharacteristic(this.api.hap.Characteristic.CurrentTemperature, value);
    });

    ////// POWER BUTTON //////

    var service_switch_power = accessory.getService('Power');
    if (!service_switch_power) {
      service_switch_power = accessory.addService(this.api.hap.Service.Switch, 'Power', this.api.hap.uuid.generate('Power'), 'power');
    }
    service_switch_power.getCharacteristic(this.api.hap.Characteristic.On).onGet(this.powerOnGet.bind(this)).onSet(this.powerOnSet.bind(this));
    service_switch_power.setCharacteristic(this.api.hap.Characteristic.Name, "Power");
    this.on('power', value => {
      this.log.info('onPower', value);
      this.data.power = value;
      service_switch_power.updateCharacteristic(this.api.hap.Characteristic.On, value);
    });

    ////// BUBBLE BUTTON //////

    var service_switch_bubble = accessory.getService('Bubble');
    if (!service_switch_bubble) {
      service_switch_bubble = accessory.addService(this.api.hap.Service.Switch, 'Bubble', this.api.hap.uuid.generate('Bubble'), 'bubble');
    }
    service_switch_bubble.getCharacteristic(this.api.hap.Characteristic.On).onGet(this.bubbleOnGet.bind(this)).onSet(this.bubbleOnSet.bind(this));
    service_switch_bubble.setCharacteristic(this.api.hap.Characteristic.Name, "Bubble");
    this.on('bubble', value => {
      this.log.info('onBubble', value);
      this.data.bubble = value;
      service_switch_bubble.updateCharacteristic(this.api.hap.Characteristic.On, value);
    });

    ////// FILTER BUTTON //////

    var service_switch_filter = accessory.getService('Filter');
    if (!service_switch_filter) {
      service_switch_filter = accessory.addService(this.api.hap.Service.Switch, 'Filter', this.api.hap.uuid.generate('Filter'), 'filter');
    }
    service_switch_filter.getCharacteristic(this.api.hap.Characteristic.On).onGet(this.filterOnGet.bind(this)).onSet(this.filterOnSet.bind(this));
    service_switch_filter.setCharacteristic(this.api.hap.Characteristic.Name, "Filter");
    this.on('filter', value => {
      this.log.info('onFilter', value);
      this.data.filter = value;
      service_switch_filter.updateCharacteristic(this.api.hap.Characteristic.On, value);
    });

    ////// EXTERNAL TEMPERATURE //////
    var service_external_temperature = accessory.getService('ExternalTemperature');
    if (!service_external_temperature) {
      service_external_temperature = accessory.addService(this.api.hap.Service.TemperatureSensor, 'ExternalTemperature', this.api.hap.uuid.generate('ExternalTemperature'), 'externaltemperature');
    }
    service_external_temperature.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature).onGet(this.externalTemeratureOnGet.bind(this));
    service_external_temperature.setCharacteristic(this.api.hap.Characteristic.Name, "External Temperature");
    this.on('external_temp', value => {
      this.log.info('onExternalTemp', value);
      this.data.external_temperature = value;
      service_external_temperature.updateCharacteristic(this.api.hap.Characteristic.CurrentTemperature, value);
    });
    this.api.updatePlatformAccessories([accessory]);
  }
  powerOnGet() {
    this.log.info('powerOnGet', this.data.power);
    return this.data.power;
  }
  powerOnSet(value) {
    this.log.info('powerOnSet', value);
    this.data.power = value;
    this.log.info('publish', TOPICS.CMD_POWER, value ? "on" : "off");
    this.client.publish(TOPICS.CMD_POWER, value ? "on" : "off");
  }
  heatingOnGet() {
    this.log.info('heatingOnGet', this.data.heater);
    return this.data.heater;
  }
  heatingOnSet(value) {
    this.log.info('heatingOnSet', value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT);
    this.data.heater = value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT;
    this.log.info('publish', TOPICS.CMD_HEATER, value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT ? "on" : "off");
    this.client.publish(TOPICS.CMD_HEATER, value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT ? "on" : "off");
  }
  targetTempOnGet() {
    this.log.info('targetTempOnGet', this.data.target_temp);
    return this.data.target_temp;
  }
  targetTempOnSet(value) {
    this.log.info('targetTempOnSet', value);
    this.data.target_temp = value;
    this.log.info('publish', TOPICS.CMD_WATER, value);
    this.client.publish(TOPICS.CMD_WATER, "".concat(value));
  }
  currentTempOnGet() {
    this.log.info('currentTempOnGet', this.data.current_temp);
    return this.data.current_temp;
  }
  bubbleOnGet() {
    this.log.info('bubbleOnGet', this.data.bubble);
    return this.data.bubble;
  }
  bubbleOnSet(value) {
    this.log.info('bubbleOnSet', value);
    this.data.bubble = value;
    this.log.info('publish', TOPICS.CMD_BUBBLE, value ? "on" : "off");
    this.client.publish(TOPICS.CMD_BUBBLE, value ? "on" : "off");
  }
  filterOnGet() {
    this.log.info('filterOnGet', this.data.filter);
    return this.data.filter;
  }
  filterOnSet(value) {
    this.log.info('filterOnSet', value);
    this.data.filter = value;
    this.log.info('publish', TOPICS.CMD_FILTER, value ? "on" : "off");
    this.client.publish(TOPICS.CMD_FILTER, value ? "on" : "off");
  }
  filterChangeOnGet() {
    this.log.info('filterChangeOnGet', this.data.filter_maintenance);
    return this.data.filter_maintenance;
  }
  externalTemeratureOnGet() {
    this.log.info('externalTemeratureOnGet', this.data.external_temp);
    return this.data.external_temp;
  }
}
exports.ESP8266IntexSBH20 = ESP8266IntexSBH20;