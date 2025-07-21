const City = require('./City');

class GameCities{
  //свойства класса
  numberHints = 3;
  lastCharForHint = "ч";
  firstCharForUser = null;
  checkedGoalGame = false;

  constructor(dataCities){
    this.mapCities = new Map();
    this.dataCities = dataCities;
  }

  randomIndex(minValue, maxValue){
    //Для целых чисел вариант
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
  }

  firstCharCity(cityName){
    return cityName.charAt(0).toLowerCase();
  }

  lastCharCity(cityName){
    let exclusionChar = ["ё", "й", "ъ", "ы", "ь"];
    let lastChar;
    let i = 1;

    // do{
    //   if( i <= cityName.length){
    //     lastChar = cityName.charAt(cityName.length - i).toLowerCase();
    //     i++;
    //   }
    // } while(exclusionChar.includes(lastChar));

  //Лучший вариант. Более безапасный не выйдет за границы.
    
  // Начинаем с последней буквы
  do {
    lastChar = cityName.charAt(cityName.length - i).toLowerCase();

    if (!exclusionChar.includes(lastChar)) {
      return lastChar; // Если символ допустим, возвращаем его
    }
    i++;
  } while (i <= cityName.length); // Проверка выхода за пределы теперь организована более точно

    return lastChar;
  }

  testMapCities(){
    let countCities = [];
    let text ="Что находиться в mapCities: \n";
    this.mapCities.forEach((value, key) => {
      text += `Ключ: ${key} количество городов: ${value.length} \n`;
      countCities.push(value.length);
      for(let v = 0; v < value.length; v++){
      text +=  value[v].testCityString() + "\n";
      }
    });

    countCities.sort((a, b) => a - b);
    console.log(countCities);
    
    return text;
  }

  fillMapCities(){
    let curentChar = "а";
    let currentArr = [];

    for(let i = 0; i < this.dataCities.length; i++){
      let  cityData = this.dataCities[i].replace('\r', ''); //удаляет символ \r из строки
      let firstChar = this.firstCharCity(cityData);
      let lastChar = this.lastCharCity(cityData);

      if(firstChar === curentChar){
        currentArr.push(new City(cityData, firstChar, lastChar));
      } else{
        // неглубокое копирование данных  currentArr  вновый массив
        //
        //Неглубокое копирование - копирует только первый уровень структуры данных. Если есть вложенные объекты/массивы — они остаются ссылками на оригинальные элементы.
        this.mapCities.set(curentChar, [...currentArr]); 
        curentChar = firstChar; //Заменяем текущий символ на новый
        currentArr = []; //очищаем массив currentArr
        currentArr.push(new City(cityData, firstChar, lastChar));
      }

      if (currentArr.length > 0) {
        this.mapCities.set(curentChar, [...currentArr]); //Добавляем данные для последней группы на последнюю букву.
      }
    }
  }
  
  binarySearch(cityName, arr) {
  const collator = new Intl.Collator('ru-RU', {
    sensitivity: 'base', // игнорирует регистр и акценты (ё/е)
    numeric: true,       // для числовой сортировки ("2" < "10")
  });

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const pivot = collator.compare(arr[middle].nameCity, cityName);

    if (pivot === 0) {
      return middle; // город найден
    } else if (pivot < 0) {
      left = middle + 1; // ищем в правой половине
    } else {
      right = middle - 1; // ищем в левой половине
    }
  }

  return -1; // город не найден
}
  
 //newCitySerch метод для поиска нового города по заданной букве  
  newCitySerch(arr) {
    if( Array.isArray(arr) && arr.length !== 0 ){
      
      let indexArrayCity = this.randomIndex(0, arr.length - 1);
      if( !arr[indexArrayCity].getIsUsed() ){
        return indexArrayCity;
      } else {
        for ( let i = 0; i < arr.length; i++ ){
          if(!arr[i].getIsUsed()){
            return i;
          }
        }
      }
    }

    return -1;
  }

  gameInit(){
    this.fillMapCities();
    this.checkedGoalGame = false;
    this.numberHints = 3;
    this.lastCharForHint = "ч";
  }

  gameStop(){
    this.checkedGoalGame = true;
  }

  gameHints(){
    let answerHintText = "Запустите игру введите \"/start\"";
    let endGameText = "Закончились города на букву " + this.lastCharForHint + "\n" +
                "Давайте начнем новую игру. Введите команду\n"+
                "\"/start\"\n";

    if(this.numberHints > 0 ){
      let answerHint = this.newCitySerch(this.mapCities.get(this.lastCharForHint));

      if (answerHint === -1) {
        answerHint = endGameText;
      } else {
        let answerHintCity = this.mapCities.get(this.lastCharForHint).at(answerHint);
        this.numberHints--;
        answerHintText = answerHintCity.nameCity + " еще не называли ;) Осталось подсказок " + this.numberHints;
      }
    } else {
      answerHintText = "К сожалению подсказки закончились";
    }
    return answerHintText;
  }

  gameLogic( userText ) {
    let winText = "Ты победили! Ура!";
    let answerText = "Запустите игру введите \"/start\"";

    if (!this.checkedGoalGame) {
      let firstCharUser = this.firstCharCity(userText);
      let lastCharUser = this.lastCharCity(userText);
           
      if(this.mapCities.has(firstCharUser)){ //Проверка есть ли город в базе на эту букву или нет
        
        let checkedIndexCity = this.binarySearch(userText, this.mapCities.get(firstCharUser));
        
        if (checkedIndexCity === -1) { //Проверка есть ли город в базе на эту букву или нет
          answerText = "Такого города, к сожалению, в России  нет. Попробуй еще раз.";
          return answerText;

        } else if(this.firstCharCity(userText) !== this.firstCharForUser && this.firstCharForUser !== null ){
          answerText = `Нужно, чтобы город начинался на ${this.firstCharForUser.toUpperCase()}`;

        } else if (this.mapCities.get(firstCharUser).at(checkedIndexCity).getIsUsed()) {//Проверка называли город или нет
          answerText = "Это город уже был. Попробуй еще раз.";
          return answerText;

        } else {
          this.mapCities.get(firstCharUser).at(checkedIndexCity).setIsUsed(true); //ставит метку, что город использован
          let ckeckedAnswer = this.newCitySerch(this.mapCities.get(lastCharUser)); //ищит ответ
          
          if (ckeckedAnswer === -1) {//игрок выбрал
            answerText = winText;
            this.checkedGoalGame = true;
          } else {
            this.mapCities.get(lastCharUser).at(ckeckedAnswer).setIsUsed(true); //ставит метку, что город использован
            let answerCity = this.mapCities.get(lastCharUser).at(ckeckedAnswer);
            let answerNameCity = answerCity.nameCity;
            let answerChar = answerCity.lastChar;
            this.firstCharForUser = answerChar;

            answerText = answerNameCity + " тебе на " + answerChar;
            this.lastCharForHint = answerChar;
          }
        }
      } else {
        answerText = "Это не похоже на название города. Попробуй снова.";
      }
    }

    return answerText;
  }
}

module.exports = GameCities;