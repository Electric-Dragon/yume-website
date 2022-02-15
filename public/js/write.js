let isDark = $('html').hasClass('dark');

toggleDark();

$('#darkOn').click(function () {
    $('html').addClass('dark');
    toggleDark();
});

$('#darkOff').click(function () {
    $('html').removeClass('dark');
    toggleDark();
});

const editor = new EditorJS({
    holder:'editorjs',
    placeholder: 'Write your next masterpiece!',
    tools: {
        header: {
            class: Header,
            shortcut: 'CMD+SHIFT+H',
            inlineToolbar: ['link'],
            levels: [2, 3, 4],
            defaultLevel: 3
        }
    }
});

$('#btnSaveDraft').click(function() {
    editor.save().then((outputData) => {
        console.log('Article data: ', outputData);     
    });
});

function toggleDark() {
    isDark = $('html').hasClass('dark');
    if (isDark) {
        $('#darkOn').hide();
        $('#darkOff').show();
    } else {
        $('#darkOff').hide();
        $('#darkOn').show();
    }
}