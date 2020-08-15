module.exports = (date) => {

    const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`


    return formattedDate
}