function assertEquals(expected, actual) {
    if (expected !== actual) {
        console.log(`Проверка провалена. Ожидалось ${expected}, получено ${actual}`);
        process.exit(0)
    } else {
        console.log(`Тест пройден!`);
    }
}

let actual = twoSum([2, 7, 11, 15], 9)
assertEquals([0, 1].toString(), actual.toString())

actual = twoSum([3, 2, 4], 6)
assertEquals([1, 2].toString(), actual.toString())

actual = twoSum([3, 3], 6)
assertEquals([0, 1].toString(), actual.toString())