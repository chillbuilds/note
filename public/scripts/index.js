let selectedFolder = ""

$(document).ready(function() {

    const toolbarOptions = [{header: [0,3,2,1]}, 'bold', 'italic', 'underline', 'link', { 'list': 'check' }, { 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }]
    const quill = new Quill('#editor', {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    })
    quill.root.setAttribute('spellcheck', false)

    let windowHeight = $(window).height()
    $('#noteContainer').attr('style', `height:${windowHeight - 32}px;`)
    $('#editor').attr('style', 'display:none;')
    $('.ql-editor').before('<input id="noteTitle" placeholder="note title" spellcheck="false">')
    $('.ql-editor').attr('style', 'padding:4px;')

    if($('.ql-editor').html() == '<p><br></p>'){
        $('.ql-editor').html('<p>enter text</p>')
    }

    $('.ql-editor').on('click', function() {
        if($('.ql-editor').html() == '<p>enter text</p>'){
            $('.ql-editor').html('')
        }
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
                        $('#noteTitle').val(noteData.title)
                        $('#noteData').text(noteData.content)
                        $('#breadCrumbs').text(noteData.folder_name + ' / ' + noteData.title)
                        $('.ql-editor').text(noteData.content)

                        console.log(noteData)
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
        if ($('#noteContainer').css('display') == 'none'){

            $('.ql-toolbar').attr('style', 'display: none;')
            $('#editor').attr('style', 'display: none;')
            $('#noteContainer').attr('style', `height:${windowHeight - 32}px;, display:flex;`)

            $('#edit').text('edit')
        }else{

            $('.ql-toolbar').attr('style', 'display: flex;')
            $('#editor').attr('style', `height:${windowHeight - 74}px;, display:flex;`)
            $('#noteContainer').attr('style', 'display: none;')

            $('#edit').text('save')
        }
    })
})