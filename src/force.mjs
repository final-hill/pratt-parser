/**
 * if lang is a function, call it to get the value
 * @param {Function|RegularLanguage} lang
 * @returns
 */
export const force = (lang) => typeof lang == 'function' ? lang() : lang