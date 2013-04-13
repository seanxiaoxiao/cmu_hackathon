// Meteor Logics
Template.editor.codeSession = function() {
  var codeSessionId = Session.get("codeSessionId");
  return CodeSession.findOne({_id: codeSessionId});
};

Template.editor.events({

  'dropover #editorInstance' : function(e, t) {
    e.preventDefault();
  },

  'drop #editorInstance' : function(e, t) {
    e.preventDefault();
  }

});

Template.editor.rendered = function() {
  cocodojo.editor = {};
  cocodojo.editor.updateDue = false;
  cocodojo.editor.disableInput = false;
  cocodojo.editor.local_uid = (((1+Math.random())*0x10000)|0).toString(16).slice(1);
  cocodojo.editor.editorInstance = ace.edit("editorInstance");
  cocodojo.editor.editorInstance.setTheme("ace/theme/monokai");
  cocodojo.editor.editorInstance.getSession().setMode("ace/mode/javascript");


  // Manual Manipulation
  cocodojo.editor.editorInstance.getSession().getDocument().on("change", function(e){
    if(cocodojo.editor.updateDue){ cocodojo.editor.updateDue = false; }
    else{
      //console.log(e);
      CodeSession.update(
        {_id: Session.get("codeSessionId")}, 
        { $set: 
          { newDelta: e.data,//cocodojo.editor.editorInstance.getValue(),
            sender_uid: cocodojo.editor.local_uid }
        }
      );
    }
  });

  var mongoQuery = CodeSession.find({_id: Session.get("codeSessionId")});
  mongoQuery.observe({
    changed : function(newDoc, oldIndex, oldDoc) {
      if(newDoc.sender_uid !== cocodojo.editor.local_uid){
        //console.log(newDoc.newDelta);
        cocodojo.editor.updateDue = true;
        cocodojo.editor.editorInstance.getSession().getDocument().applyDeltas([newDoc.newDelta]);
      }
    }
  });
  $('#editorInstance').parent().css('padding', '1em');

  $('#editorInstance').on('keydown', function(e){
    if(cocodojo.editor.disableInput){ e.preventDefault(); }
    else{
      cocodojo.editor.disableInput = true;
      setTimeout(function(){ cocodojo.editor.disableInput = false; }, 50);
    }
  });

  $('#editorInstance').on('ondragover',function() {
    e.stopPropagation();
    return false;
  });
  $('#editorInstance').on('ondragend',function() {
    e.stopPropagation();
    return false;
  });
  $('#editorInstance').on('ondrop',function(e) {
    if (e.preventDefault) e.preventDefault();
    e.stopPropagation();
    var file = e.dataTransfer.files[0], reader = new FileReader();
    reader.onload = function (event) {
      console.log(event.target);
    };
    return false;
  });

  filepicker.setKey("A5FhMuKiRViDaQtnHUotPz");
  filepicker.makeDropPane($('#exampleDropPane')[0], {
    multiple: true,
    dragEnter: function() {
      $("#exampleDropPane").html("Drop to upload").css({
        'backgroundColor': "#E0E0E0",
        'border': "1px solid #000"
      });
    },
    dragLeave: function() {
      $("#exampleDropPane").html("Drop files here").css({
        'backgroundColor': "#F6F6F6",
        'border': "1px dashed #666"
      });
    },
    onSuccess: function(fpfiles) {
      $("#exampleDropPane").text("Done, see result below");
      filepicker.read(fpfiles[0], function(data){
        console.log(fpfiles[0].filename);
        cocodojo.editor.editorInstance.setValue(data);
      });
    },
    onError: function(type, message) {
      $("#localDropResult").text('('+type+') '+ message);
    },
    onProgress: function(percentage) {
      $("#exampleDropPane").text("Uploading ("+percentage+"%)");
    }
  });
};
