export default function getAvatarInitials(textString) {
    if (!textString) return "";
    const text = textString.trim();
    const textSplit = text.split(" ");
    if (textSplit.length <= 1) return text.toUpperCase().charAt(0);
    const initials =
        textSplit[0].toUpperCase().charAt(0) + textSplit[textSplit.length - 1].toUpperCase().charAt(0);
    return initials;
};