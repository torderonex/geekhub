
function assertEquals(expected, actual) {
    if (expected !== actual) {
        console.log(`Проверка провалена. Ожидалось ${expected}, получено ${actual}`);
        process.exit(0)
    } else {
        console.log(`Тест пройден!`);
    }
}

let actual = add(2,2) 
assertEquals(4,actual)
actual = add(5000,5) 
assertEquals(5005,actual)
actual = add(-10,2) 
assertEquals(-8,actual)
