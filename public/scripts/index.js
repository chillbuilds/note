let currentFolder = ''
let currentFolderID = ''
let currentNote = ''
let currentNoteID = ''
let editMode = false

$(document).ready(function() {

const toolbarOptions = [{header: [0,3,2,1]}, 'bold', 'italic', 'underline', 'link', { 'list': 'check' }, { 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }]
const quill = new Quill('#editor', {
    modules: {
        toolbar: toolbarOptions
    },
    theme: 'snow'
})
quill.root.setAttribute('spellcheck', false)

$('#noteContainer').on('click', )

let windowHeight = $(window).height()
$('#noteContainer').attr('style', `height:${windowHeight - 32}px;`)
$('#editor').attr('style', 'display:none;')
$('.ql-editor').before('<input id="noteTitle" placeholder="note title" spellcheck="false">')
$('.ql-editor').attr('style', 'padding:4px;')

if($('.ql-editor').html() == '<p><br></p>'){
    $('.ql-editor').html('<p>enter text</p>')
}

$('.sideColIcon').on('click', function() {
    let actionBtn = $(this).attr('id')

    if(actionBtn == 'addNote'){
        if($('#editor').css('display') == 'none'){
            $('#noteTitle').val('')
            $('.ql-editor').html('<p>enter text</p>')
            $('#update').click()
            $('#noteTitle').focus()
            editMode = true
        }
    }

    if(actionBtn == 'deleteNote'){

    }

    if(actionBtn == 'addFolder'){
        let folderName = $('#folderInput').val()
        if(folderName){
            $.ajax({
            url: '/add_folder',
            method: 'POST',
            data: {
                name: folderName, user_id: 1
            },
            success: function(response) {
                console.log(response)
            },
            error: function(xhr, status, error) {
                console.error(error)
            }
            })
        }else{
            alert('folder name is blank')
        }
    }
    
    if(actionBtn == 'deleteFolder'){

    }
})

let updateUI = () => {

    $.ajax({
        url: '/last_note',
        method: 'GET',
        success: function(noteData) {
            if(!noteData.length){
                // fix - make em make a note
            }else{
                noteData = noteData[0]
                console.log(noteData)
                $('#noteTitle').val(noteData.title)
                $('#displayTitle').text(noteData.title)
                $('#noteData').html(noteData.content)
                $('.ql-editor').html(noteData.content)
                currentNote = noteData.title
                currentNoteID = noteData.id
                currentFolder = noteData.folder_name
                currentFolderID = noteData.folder_id
                console.log(currentFolderID)
            }
        },
        error: function(xhr, status, error) {
            console.error("Error retrieving note:", error)
        }
    }).then( err => {

    $.get('/folder_names', function(folderNames) {
        console.log(folderNames)
        $('#folders').html('')
        folderNames.forEach(folder => {
            $('#folders').append(`<div val="${folder.name}" id="folder-${folder.folder_id}" class="folder">${folder.name}</div>`)
        })

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
                currentFolder = noteData.folder_name
                currentFolderID = noteData.folder_id

                console.log(currentFolderID)

                $('.note').attr('style', 'background:#EFEFEF; color:black;')
                $(`.note[val="${currentNote}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')
            })
        })

        
    }).then(err => {
    $('.folder').on('click', function() {

        let folderName = $(this).text()
        currentFolderID = $(this).attr('id').split('folder-').join('')
        currentFolder = folderName

        $('.folder').attr('style', 'background:#EFEFEF; color:black;')
        $(`.folder[val="${currentFolder}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')

        $.get('/note_names', {folder_name: folderName}, function(noteNames) {

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
                    currentFolder = noteData.folder_name
                    currentFolderID = noteData.folder_id

                    console.log(currentFolderID)

                    $('.note').attr('style', 'background:#EFEFEF; color:black;')
                    $(`.note[val="${currentNote}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')

                    console.log(noteData)
                })
            })
        })
    })
    $(`.folder[val="${currentFolder}"]`).attr('style', 'background:#1D3461; color:#EFEFEF;')})
    }).fail(function(err) {
        alert('error fetching data')
        console.log(err)
    })

}

    updateUI()

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

        let noteObj = {title: $('#noteTitle').val(), content: $('.ql-editor').html(), folder_id: currentFolderID, id: currentNoteID}

        if(editMode == true){
            $.ajax({
                url: '/add_note',
                method: 'POST',
                data: {
                    user_id: 1,
                    title: $('#noteTitle').val(),
                    content: $('.ql-editor').html(),
                    folder_id: currentFolderID
                },
                success: function(response) {
                    console.log('note added successfully:', response)
                    editMode == true
                },
                error: function(xhr, status, error) {
                    console.error('Error updating note:', error)
                }
            })
        }else{
            $.get('/update_note', noteObj, function(noteData) {
                console.log(noteData)
            })
        }

        updateUI()

    }else{

        // console.log('currentFolder:', currentFolder)
        console.log('currentNote:', currentNote)

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

setInterval(()=>{
    console.log(currentFolderID)
}, 1000)