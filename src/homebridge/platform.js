export const PLATFORM_NAME = 'HomebridgeIntexSBH20';
export const PLUGIN_NAME = 'homebridge-intexsbh20';
import * as mqtt from "mqtt"
import EventEmitter from "events";

const TOPICS = {
    BUBBLE     : "pool/bubble",
    ERROR      : "pool/error",
    FILTER     : "pool/filter",
    HEATER     : "pool/heater",
    MODEL      : "pool/model",
    POWER      : "pool/power",
    WATER_ACT  : "pool/water/tempAct",
    WATER_SET  : "pool/water/tempSet",
    VERSION    : "wifi/version",
    IP         : "wifi/ip",
    RSSI       : "wifi/rssi",
    WIFI_TEMP  : "wifi/temp",
    STATE      : "wifi/state",
    CMD_BUBBLE : "pool/command/bubble",
    CMD_FILTER : "pool/command/filter",
    CMD_HEATER : "pool/command/heater",
    CMD_POWER  : "pool/command/power",
    CMD_WATER  : "pool/command/water/tempSet",
    CMD_OTA    : "wifi/command/update",
}

class ESP8266IntexSBH20 extends EventEmitter {
    constructor(log, config, api) {
        super()
        this.log = log;
        this.config = config;
        this.api = api;
        this.client = mqtt.connect(`mqtt://${this.config.host}`)
        this.accessories = []

        this.data = {
            power:false,
            bubble:false,
            heater:false,
            filter:false,
            current_temp:20,
            target_temp:40,
            external_temp:-75
        }

        api.on("didFinishLaunching" , async () => {
            this.log.info("didFinishLaunching");
            this.client.on('connect', function (cl) {

                this.subscribe(TOPICS.BUBBLE)
                this.subscribe(TOPICS.ERROR)
                this.subscribe(TOPICS.FILTER)
                this.subscribe(TOPICS.HEATER)
                this.subscribe(TOPICS.MODEL)
                this.subscribe(TOPICS.POWER)
                this.subscribe(TOPICS.WATER_ACT)
                this.subscribe(TOPICS.WATER_SET)
                this.subscribe(TOPICS.VERSION)
                this.subscribe(TOPICS.IP)
                this.subscribe(TOPICS.RSSI)
                this.subscribe(TOPICS.WIFI_TEMP)
                this.subscribe(TOPICS.STATE)

            })

            this.client.on('message', function (topic, message) {

                let msg = message.toString()
                this.log.debug(topic, msg)

                switch (topic) {
                    case TOPICS.BUBBLE :
                        this.data.bubble = (msg === "on")
                        this.emit('bubble', this.data.bubble)
                        break
                    case TOPICS.ERROR :
                        break
                    case TOPICS.FILTER :
                        this.data.filter = (msg === "on")
                        this.emit('filter', this.data.filter)
                        break
                    case TOPICS.HEATER :
                        this.data.heater = (msg === "on")
                        this.emit('heater', this.data.heater)
                        break
                    case TOPICS.MODEL :
                        break
                    case TOPICS.POWER :
                        this.data.power = (msg === "on")
                        this.emit('power', this.data.power)
                        break
                    case TOPICS.WATER_ACT :
                        this.data.current_temp = parseFloat(msg)
                        this.emit('current_temp', this.data.current_temp)
                        break
                    case TOPICS.WATER_SET :
                        this.data.target_temp = parseFloat(msg)
                        this.emit('target_temp', this.data.target_temp)
                        break
                    case TOPICS.VERSION :
                        break
                    case TOPICS.IP :
                        break
                    case TOPICS.RSSI :
                        break
                    case TOPICS.WIFI_TEMP :
                        this.data.external_temp = parseFloat(msg)
                        this.emit('external_temp', this.data.external_temp)
                        break
                    case TOPICS.STATE :
                        break
                }
            }.bind(this))

            const uuid = api.hap.uuid.generate('homebridge:esp8266-intexsbh20');

            // check the accessory was not restored from cache
            if (!this.accessories.find(accessory => accessory.UUID === uuid)) {

                const accessory = new this.api.platformAccessory('Intex SPA', uuid);

                this.configureAccessory(accessory)

                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }
        });
    }


    configureAccessory(accessory) {
        this.accessories.push(accessory)

        accessory.category = this.api.hap.Categories.THERMOSTAT;

        accessory.displayName = 'Intex SPA'

        let service_information = accessory.getService(this.api.hap.Service.AccessoryInformation);
        service_information
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Intex")
            .setCharacteristic(this.api.hap.Characteristic.Model, "SBH20")
            .setCharacteristic(this.api.hap.Characteristic.Name, "ESP8266 Intex SBH20")
            .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, "1.0.0")

        ////// THERMOSTAT //////

        let service_thermostat = accessory.getService(this.api.hap.Service.Thermostat);
        if (!service_thermostat) {
            service_thermostat = accessory.addService(this.api.hap.Service.Thermostat);
        }

        service_thermostat.removeCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
        service_thermostat.removeCharacteristic(this.api.hap.Characteristic.TargetRelativeHumidity)

        let characteristic_currentHeatingCoolingState = service_thermostat.getCharacteristic(this.api.hap.Characteristic.CurrentHeatingCoolingState)
        characteristic_currentHeatingCoolingState.setProps({ minStep: 1, minValue: this.api.hap.Characteristic.TargetHeatingCoolingState.OFF, maxValue: this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT, validValues:[this.api.hap.Characteristic.TargetHeatingCoolingState.OFF, this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT] })

        let characteristic_targetHeatingCoolingState = service_thermostat.getCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState)
        characteristic_targetHeatingCoolingState.setProps({ minStep: 1, minValue: this.api.hap.Characteristic.TargetHeatingCoolingState.OFF, maxValue: this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT, validValues:[this.api.hap.Characteristic.TargetHeatingCoolingState.OFF, this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT] })
        characteristic_targetHeatingCoolingState.onGet(this.heatingOnGet.bind(this))
        characteristic_targetHeatingCoolingState.onSet(this.heatingOnSet.bind(this));

        this.on('heater', (value) => {
            this.log.info('onHeater', value)
            this.data.heater = value
            service_thermostat.updateCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState, value?this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT:this.api.hap.Characteristic.TargetHeatingCoolingState.OFF)
        })

        let characteristic_targetTemperature = service_thermostat.getCharacteristic(this.api.hap.Characteristic.TargetTemperature)
        characteristic_targetTemperature.setProps({ minStep: 1, minValue: 20, maxValue: 40 })
        characteristic_targetTemperature.onGet(this.targetTempOnGet.bind(this))
        characteristic_targetTemperature.onSet(this.targetTempOnSet.bind(this))

        this.on('target_temp', (value) => {
            this.log.info('onTargetTemp', value)
            this.data.target_temp = value
            service_thermostat.updateCharacteristic(this.api.hap.Characteristic.TargetTemperature, value)
        })

        let characteristic_currentTemperature = service_thermostat.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
        characteristic_currentTemperature.setProps({ minStep: 1, minValue: 20, maxValue: 40 })
        characteristic_currentTemperature.onGet(this.currentTempOnGet.bind(this))

        this.on('current_temp', (value) => {
            this.log.info('onCurrentTemp', value)
            this.data.current_temp = value
            service_thermostat.updateCharacteristic(this.api.hap.Characteristic.CurrentTemperature, value)
        })

        ////// POWER BUTTON //////

        let service_switch_power = accessory.getService('Power');
        if (!service_switch_power) {
            service_switch_power = accessory.addService(this.api.hap.Service.Switch, 'Power', this.api.hap.uuid.generate('Power'), 'power');
        }
        service_switch_power.getCharacteristic(this.api.hap.Characteristic.On)
            .onGet(this.powerOnGet.bind(this))
            .onSet(this.powerOnSet.bind(this))

        service_switch_power.setCharacteristic(this.api.hap.Characteristic.Name, "Power")

        this.on('power', (value) => {
            this.log.info('onPower', value)
            this.data.power = value
            service_switch_power.updateCharacteristic(this.api.hap.Characteristic.On, value)
        })

        ////// BUBBLE BUTTON //////

        let service_switch_bubble = accessory.getService('Bubble');
        if (!service_switch_bubble) {
            service_switch_bubble = accessory.addService(this.api.hap.Service.Switch, 'Bubble', this.api.hap.uuid.generate('Bubble'), 'bubble');
        }
        service_switch_bubble.getCharacteristic(this.api.hap.Characteristic.On)
            .onGet(this.bubbleOnGet.bind(this))
            .onSet(this.bubbleOnSet.bind(this))

        service_switch_bubble.setCharacteristic(this.api.hap.Characteristic.Name, "Bubble")

        this.on('bubble', (value) => {
            this.log.info('onBubble', value)
            this.data.bubble = value
            service_switch_bubble.updateCharacteristic(this.api.hap.Characteristic.On, value)
        })

        ////// FILTER BUTTON //////

        let service_switch_filter = accessory.getService('Filter');
        if (!service_switch_filter) {
            service_switch_filter = accessory.addService(this.api.hap.Service.Switch, 'Filter', this.api.hap.uuid.generate('Filter'), 'filter');
        }
        service_switch_filter.getCharacteristic(this.api.hap.Characteristic.On)
            .onGet(this.filterOnGet.bind(this))
            .onSet(this.filterOnSet.bind(this))

        service_switch_filter.setCharacteristic(this.api.hap.Characteristic.Name, "Filter")

        this.on('filter', (value) => {
            this.log.info('onFilter', value)
            this.data.filter = value
            service_switch_filter.updateCharacteristic(this.api.hap.Characteristic.On, value)
        })

        ////// EXTERNAL TEMPERATURE //////
        let service_external_temperature = accessory.getService('ExternalTemperature');
        if (!service_external_temperature) {
            service_external_temperature = accessory.addService(this.api.hap.Service.TemperatureSensor, 'ExternalTemperature', this.api.hap.uuid.generate('ExternalTemperature'), 'externaltemperature');
        }
        service_external_temperature.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
            .onGet(this.externalTemeratureOnGet.bind(this))

        service_external_temperature.setCharacteristic(this.api.hap.Characteristic.Name, "External Temperature");

        this.on('external_temp', (value) => {
            this.log.info('onExternalTemp', value);
            this.data.external_temperature = value;
            service_external_temperature.updateCharacteristic(this.api.hap.Characteristic.CurrentTemperature, value);
        })

        this.api.updatePlatformAccessories([accessory])
    }

    powerOnGet(){
        this.log.info('powerOnGet', this.data.power)
        return this.data.power
    }

    powerOnSet(value){
        this.log.info('powerOnSet', value)
        this.data.power = value

        this.log.info('publish', TOPICS.CMD_POWER, value?"on":"off")
        this.client.publish(TOPICS.CMD_POWER, value?"on":"off");
    }

    heatingOnGet(){
        this.log.info('heatingOnGet', this.data.heater)
        return this.data.heater
    }

    heatingOnSet(value){
        this.log.info('heatingOnSet', (value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT))
        this.data.heater = (value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT)

        this.log.info('publish', TOPICS.CMD_HEATER, (value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT)?"on":"off")
        this.client.publish(TOPICS.CMD_HEATER, (value === this.api.hap.Characteristic.TargetHeatingCoolingState.HEAT)?"on":"off");
    }

    targetTempOnGet(){
        this.log.info('targetTempOnGet', this.data.target_temp)
        return this.data.target_temp
    }

    targetTempOnSet(value){
        this.log.info('targetTempOnSet', value)
        this.data.target_temp = value

        this.log.info('publish', TOPICS.CMD_WATER, value)
        this.client.publish(TOPICS.CMD_WATER, `${value}`);
    }

    currentTempOnGet(){
        this.log.info('currentTempOnGet', this.data.current_temp)
        return this.data.current_temp
    }

    bubbleOnGet(){
        this.log.info('bubbleOnGet', this.data.bubble)
        return this.data.bubble
    }

    bubbleOnSet(value){
        this.log.info('bubbleOnSet', value)
        this.data.bubble = value

        this.log.info('publish', TOPICS.CMD_BUBBLE, value?"on":"off")
        this.client.publish(TOPICS.CMD_BUBBLE, value?"on":"off");
    }

    filterOnGet(){
        this.log.info('filterOnGet', this.data.filter)
        return this.data.filter
    }

    filterOnSet(value){
        this.log.info('filterOnSet', value)
        this.data.filter = value

        this.log.info('publish', TOPICS.CMD_FILTER, value?"on":"off")
        this.client.publish(TOPICS.CMD_FILTER, value?"on":"off");
    }

    filterChangeOnGet(){
        this.log.info('filterChangeOnGet', this.data.filter_maintenance)
        return this.data.filter_maintenance
    }

    externalTemeratureOnGet(){
        this.log.info('externalTemeratureOnGet', this.data.external_temp)
        return this.data.external_temp
    }
}



export { ESP8266IntexSBH20 };
