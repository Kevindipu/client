import React, { useCallback, useEffect, useState } from 'react'
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
import { io } from 'socket.io-client'
import './styles.css'
import { useParams } from 'react-router-dom'

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block'],
  ['clean'],
]

function TextEditor() {
  //the params contains the id, which we rename to documentId
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()

  //this is used to connect and disconnect to the server
  useEffect(() => {
    //3001 is server port
    const s = io(process.env.REACT_APP_SERVER_URL)
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  //to detect changes in the texteditor(person A) and transmitts to server/other user(person B)
  useEffect(() => {
    if (socket == null || quill == null) {
      return
    }
    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') {
        return
      }
      //send new changes i.e delta to server with event name 'send-changes'
      socket.emit('send-changes', delta)
    }
    quill.on('text-change', handler)

    //once the event 'text-change' is over, remove it
    return () => {
      quill.off('text-change', handler)
    }
  }, [socket, quill])

  //this is used to update the changes in text editor(person A) done by the other user(person B)
  useEffect(() => {
    if (socket == null || quill == null) {
      return
    }
    const handler = (delta) => {
      //update new changes i.e delta to quill
      quill.updateContents(delta)
    }
    socket.on('recieve-changes', handler)

    //once the event 'text-change' is over, remove it
    return () => {
      socket.off('recieve-changes', handler)
    }
  }, [socket, quill])

  //connect to a specific room so that only users in that room can modify the doc
  useEffect(() => {
    if (socket == null || quill == null || documentId == null) {
      return
    }
    //get the document using documentId and set load up the document
    socket.once('load-document', (document) => {
      quill.setContents(document)
      quill.enable()
    })
    socket.emit('get-document', documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) {
      return
    }

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  //makes the editor using quill
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return

    wrapper.innerHTML = ''
    const editor = document.createElement('div')
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    q.disable()
    q.setText('Loading.....')
    setQuill(q)
  }, [])

  return <div className="container" ref={wrapperRef}></div>
}

export default TextEditor
