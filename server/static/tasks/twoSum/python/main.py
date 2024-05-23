def assert_equals(expected, actual):
    if expected != actual:
        print(f"Проверка провалена. Ожидалось {expected}, получено {actual}")
        exit(0)
    else:
        print(f"Тест пройден!")

def run_tests():
    actual = twoSum([2, 7, 11, 15], 9)
    assert_equals([0, 1], actual)

    actual = twoSum([3, 2, 4], 6)
    assert_equals([1, 2], actual)

    actual = twoSum([3, 3], 6)
    assert_equals([0, 1], actual)

run_tests()
