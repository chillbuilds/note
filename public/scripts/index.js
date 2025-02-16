let currentFolder = ''
let currentNote = ''
let currentNoteID = ''

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

let updateUI = () => {

    $.get('/last_note', function(noteData) {
        noteData = noteData[0]
        $('#noteTitle').val(noteData.title)
        $('#displayTitle').text(noteData.title)
        $('#noteData').html(noteData.content)
        $('.ql-editor').html(noteData.content)
        currentNote = noteData.title
        currentNoteID = noteData.id
        currentFolder = noteData.folder_name
    }).then( err => {

    $.get('/folder_names', function(folderNames) {

        $('#folders').html('')
        folderNames.forEach(folder => {
            $('#folders').append(`<div val="${folder.folder_name}" class="folder">${folder.folder_name}</div>`)
        })

    }).then(err => {
    $.get('/note_names', {folder_name: currentFolder}, function(noteNames) {

        $('#notes').html('')
        noteNames.forEach(note => {
            $('#notes').append(`<div val="${note.title}" class="note">${note.title}</div>`)
        })

        $(`.note[val="${currentNote}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')

        $('.note').on('click', function() {
            const noteName = $(this).text()
            $.get('/note', {title: noteName}, function(noteData) {
                noteData = noteData[0]
                $('#noteTitle').val(noteData.title)
                $('#displayTitle').text(noteData.title)
                $('#noteData').html(noteData.content)
                $('.ql-editor').html(noteData.content)
                currentNote = noteData.title
                currentNoteID = noteData.id

                $('.note').attr('style', 'background:#EFEFEF; color:black;')
                $(`.note[val="${currentNote}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')

                console.log(noteData)
            })
        })
    })

    $('.folder').on('click', function() {

        let folderName = $(this).text()
        currentFolder = folderName

        $('.folder').attr('style', 'background:#EFEFEF; color:black;')
        $(`.folder[val="${currentFolder}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')

        $.get('/note_names', {folder_name: folderName}, function(noteNames) {

            $('#notes').html('')
            noteNames.forEach(note => {
                $('#notes').append(`<div val="${note.title}" class="note">${note.title}</div>`)
            })


            $('.note').on('click', function() {
                const noteName = $(this).text()
                $.get('/note', {title: noteName}, function(noteData) {
                    noteData = noteData[0]
                    $('#noteTitle').val(noteData.title)
                    $('#displayTitle').text(noteData.title)
                    $('#noteData').html(noteData.content)
                    $('.ql-editor').html(noteData.content)
                    currentNote = noteData.title
                    currentNoteID = noteData.id

                    $('.note').attr('style', 'background:#EFEFEF; color:black;')
                    $(`.note[val="${currentNote}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')

                    console.log(noteData)
                })
            })
        })
    })
    $(`.folder[val="${currentFolder}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')
    })
    }).fail(function(err) {
        alert('error fetching data')
        console.log(err)
    })

}

$.get('/last_note', function(noteData) {
    noteData = noteData[0]
    $('#noteTitle').val(noteData.title)
    $('#displayTitle').text(noteData.title)
    $('#noteData').html(noteData.content)
    $('.ql-editor').html(noteData.content)
    currentNote = noteData.title
    currentNoteID = noteData.id
    currentFolder = noteData.folder_name

}).then(err => {
    $.get('/folder_names', function(folderNames) {

        $('#folders').html('')
        folderNames.forEach(folder => {
            $('#folders').append(`<div val="${folder.folder_name}" class="folder">${folder.folder_name}</div>`)
        })
    }).then(err => {
        updateUI()
    })
})

$('.ql-editor').on('click', function() {
    if($('.ql-editor').html() == '<p>enter text</p>'){
        $('.ql-editor').html('')
    }
})

$('#update').on('click', function() {
    if ($('#noteContainer').css('display') == 'none'){

        $('.ql-toolbar').attr('style', 'display: none;')
        $('#editor').attr('style', 'display: none;')
        $('#noteContainer').attr('style', `height:${windowHeight - 32}px;, display:flex;`)

        $('#update').text('edit')

        let noteObj = {title: $('#noteTitle').val(), content: $('.ql-editor').html(), folder_name: currentFolder, id: currentNoteID}

        console.log(noteObj)

        $.get('/update_note', noteObj, function(noteData) {
            console.log(noteData)
        })

        updateUI()

    }else{

        $('.ql-toolbar').attr('style', 'display: flex;')
        $('#editor').attr('style', `height:${windowHeight - 74}px;, display:flex;`)
        $('#noteContainer').attr('style', 'display: none;')

        $('#update').text('save')

        if($('.ql-editor').html() == '<p><br></p>'){
            $('.ql-editor').html('<p>enter text</p>')
        }
    }
})

})