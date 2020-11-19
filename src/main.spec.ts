import { isVowel } from './main'

test('should return true given the letter a', () => {
    expect(isVowel('a')).toBe(true)
})

test('should return false given the letter b', () => {
    expect(isVowel('b')).toBe(false)
})