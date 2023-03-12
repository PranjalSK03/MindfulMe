
exports.getDate = function() {

    let date = new Date();

    let options = {
        weekday : "long",
        day : "numeric", 
        month : "long",
        year : "numeric"
    }

    return date.toLocaleDateString("en-US", options);

}