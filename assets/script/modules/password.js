// Encrypt a given string
const encrypt = (key, string) => {
  let result = "";
  for (i = 0; i < string.length; i++) {
    result += String.fromCharCode(key^string.charCodeAt(i));
  }
  return result;
}

// Decrypt a given string
const decrypt = (key, string) => {
  let result = "";
  for (i = 0; i < string.length; i++) {
    result += String.fromCharCode(key^string.charCodeAt(i));
  }
  return result;
}

// Export functions
module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
};
