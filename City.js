class City{
  #isUsed = false;  //приватная переменая

  //конструктор
  constructor(nameCity, firstChar, lastChar){
    this.nameCity = nameCity;
    this.firstChar = firstChar;
    this.lastChar = lastChar;
 }

 testCity(){
    console.log(`Название города: ${this.nameCity}; Первая буква: ${this.firstChar}; Последняя буква: ${this.lastChar}; Использовано ${this.#isUsed}`);
 }

  testCityString(){
    let str;
    return str = `Название: ${this.nameCity}; Первая буква: ${this.firstChar}; Последняя буква: ${this.lastChar}; Использовано ${this.#isUsed}`;
 }

 //установка значение isUsed
 setIsUsed(value){
  this.#isUsed = value;
 }

 getIsUsed(){
  return this.#isUsed
 }
}

module.exports = City;