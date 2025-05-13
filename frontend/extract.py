import zipfile
import os

def extract_zip(zip_path, extract_to='.'):
    """
    Extracts a zip file to the specified directory.

    Parameters:
    zip_path (str): Path to the zip file.
    extract_to (str): Directory to extract the contents to. Defaults to current directory.
    """
    if not zipfile.is_zipfile(zip_path):
        print("The file is not a valid zip archive.")
        return

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
        print(f"Extracted all files to '{extract_to}'")

# Example usage:
zip_file_path = 'a.zip'        # Replace with your zip file path
destination_folder = '.'    # Replace with your target folder
os.makedirs(destination_folder, exist_ok=True)
extract_zip(zip_file_path, destination_folder)
