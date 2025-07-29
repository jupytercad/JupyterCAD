import json
import os
import tempfile
from jupytercad_lab.notebook.cad_document import CadDocument

def test_save_and_load():
    # Create a new CadDocument
    doc = CadDocument()
    doc.add_box(name="Box1", length=1, width=2, height=3)
    doc.add_cylinder(name="Cylinder1", radius=1, height=5)

    # Save the document to a temporary file
    with tempfile.NamedTemporaryFile(mode="w+", delete=False, suffix=".jcad") as tmp:
        doc.save(tmp.name)
        tmp_path = tmp.name

    # Load the document from the temporary file
    loaded_doc = CadDocument.load(tmp_path)

    # Check that the loaded document has the same objects as the original
    assert loaded_doc.objects == ["Box1", "Cylinder1"]

    # Check the parameters of the loaded objects
    box1 = loaded_doc.get_object("Box1")
    assert box1.parameters.Length == 1
    assert box1.parameters.Width == 2
    assert box1.parameters.Height == 3

    cylinder1 = loaded_doc.get_object("Cylinder1")
    assert cylinder1.parameters.Radius == 1
    assert cylinder1.parameters.Height == 5

    # Clean up the temporary file
    os.remove(tmp_path)


def test_save_and_load_simplified():
    # Create a new CadDocument
    doc = CadDocument()
    doc.add_box(name="Box1", length=1, width=2, height=3)
    doc.add_cylinder(name="Cylinder1", radius=1, height=5)

    # Save the document to a temporary file
    with tempfile.NamedTemporaryFile(mode="w+", delete=False, suffix=".jcad") as tmp:
        doc.save(tmp.name)
        tmp_path = tmp.name

    # Load the document from the temporary file
    loaded_doc = CadDocument.load_simplified(tmp_path)

    # Check that the loaded document has the same objects as the original
    assert loaded_doc.objects == ["Box1", "Cylinder1"]

    # Check the parameters of the loaded objects
    box1 = loaded_doc.get_object("Box1")
    assert box1.parameters.Length == 1
    assert box1.parameters.Width == 2
    assert box1.parameters.Height == 3

    cylinder1 = loaded_doc.get_object("Cylinder1")
    assert cylinder1.parameters.Radius == 1
    assert cylinder1.parameters.Height == 5

    # Clean up the temporary file
    os.remove(tmp_path)
