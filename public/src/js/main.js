// Attachement
$("#goodsRequestAttachment_btn").change((e) => {
    $("#good_request_form_submit-btn").attr("disabled", true)
    $("#good_request_form_submit-btn").html('Uploading...')
    $("#attachAttachment-File").html('Uploading...')
    $("#good_request_form_submit-btn").attr('class', 'btn btn-secondary')
    var file = e.target.files[0];
    var today_timestamp = new Date();
    // Create a storage ref
    var uid = create_UUID();
    var storageRef = firebase.storage().ref('Goods_Requests_Attachment/' + today_timestamp+'/' + uid +"-" +file.name);
        fileName = uid +"-" +file.name
    // Upload File
    var task = storageRef.put(file);
    task.on('state_changed',
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        function error(err) {
            console.log(err);
        },
        function complete() {
            storageRef.getDownloadURL().then((url) => {
                $("#attachment_URL").val(url);
                $("#good_request_form_submit-btn").attr("disabled", false);
                $("#good_request_form_submit-btn").html('Submit');
                $("#attachAttachment-File").html('Attachment Uploaded');
                $("#good_request_form_submit-btn").attr('class', 'btn btn-primary');
            })
        }
    );
});


// Attachement of Quatation
$("#quatation-btn").change((e) => {
    $("#sendQuatation-btn").attr("disabled", true)
    $("#sendQuatation-btn").html('Uploading...')
    $("#attachAttachment-File").html('Uploading...')
    $("#sendQuatation-btn").attr('class', 'btn w-25 btn-secondary')
    var file = e.target.files[0];
    var today_timestamp = new Date();
    // Create a storage ref
    var uid = create_UUID();
    var storageRef = firebase.storage().ref('Goods_Quatation_Attachment/' + today_timestamp+'/' + uid +"-" +file.name);
        fileName = uid +"-" +file.name
    // Upload File
    var task = storageRef.put(file);
    task.on('state_changed',
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        function error(err) {
            console.log(err);
        },
        function complete() {
            storageRef.getDownloadURL().then((url) => {
                $("#attachment_URL").val(url);
                $("#sendQuatation-btn").attr("disabled", false);
                $("#sendQuatation-btn").html('Send');
                $("#attachAttachment-File").html('Quatation Uploaded');
                $("#sendQuatation-btn").attr('class', 'btn w-25 btn-primary');
            })
        }
    );
});


// Deleting the Goods Request
$('.deleteGoodsRequest').on('click', function(e) {
    e.preventDefault();
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            $(this).closest('form').submit();
        } 
      });
});


// Deleting the Quatations Request
$('.deleteQuatation').on('click', function(e) {
    e.preventDefault();
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            $(this).closest('form').submit();
        } 
      });
});


// Functions Declared
// Generating UID
function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}