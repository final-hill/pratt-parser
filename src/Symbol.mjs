export class Symbol {
    constructor(name, bindingPower) {
        this.name = name;
        this.leftBindingPower = bindingPower;
    }
    nud() {
        throw new Error(`Undefined nud for ${this.name}`);
    }
    led(left) {
        throw new Error(`Undefined led for ${this.name}`);
    }
}