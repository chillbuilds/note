let selectedFolder = ""

$(document).ready(function() {

    const toolbarOptions = [{header: [0,3,2,1]}, 'bold', 'italic', 'underline', 'link', { 'list': 'check' }, { 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }]
    const quill = new Quill('#editor', {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    })
    
    $.get('/folder_names', function(folderNames) {

        folderNames.forEach(folder => {
            $('#folders').append(`<div class="folder">${folder.folder_name}</div>`)
        })

        $('.folder').on('click', function() {
            let folderName = $(this).text()
            $.get('/note_names', {folder_name: folderName}, function(noteNames) {

                $('#notes').html('')
                noteNames.forEach(note => {
                    console.log(note.title)
                    $('#notes').append(`<div class="note">${note.title}</div>`)
                })

                $('.note').on('click', function() {
                    const noteName = $(this).text()
                    $.get('/note', {title: noteName}, function(noteData) {
                        noteData = noteData[0]
                        $('#noteData').text(noteData.content)
                        $('#breadCrumbs').text(noteData.folder_name + ' / ' + noteData.title)
                        console.log(noteData)
                        $('.ql-editor').text(noteData.content)
                    })
                })
            })
        })
      
    }).fail(function(err) {
      alert('error fetching data')
      console.log(err)
    })

    $('#update').on('click', function() {
        console.log($('.ql-editor').html().toString())
        // console.log(quill.getContents().ops)
    })

    $('#edit').on('click', function() {
        if ($('#noteContainer').css('display') != 'none'){
            $('#noteContainer').slideUp(500, 'swing', function() {
                $('.ql-toolbar').slideDown()
                $('#editor').slideDown()
            })
        }else{
            $('.ql-toolbar').slideUp()
            $('#editor').slideUp(500, 'swing', function() {
                $('#noteContainer').slideDown()
            })
        }
    })
})