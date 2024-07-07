async function generateUniqueReferralCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let newReferralCode = "";

  for (let i = 0; i < 8; i++) {
    // Adjust length as needed
    newReferralCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return newReferralCode;
}

module.exports = generateUniqueReferralCode;
